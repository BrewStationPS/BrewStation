#/usr/bin/env python3 

import json
import requests
import io
import zipfile
import struct
import os

s = requests.Session()
s.headers = {"User-Agent": "add_homebrew.py"}


def read_int32(f):
    return struct.unpack("I", f.read(4))[0]

def read_int16(f):
    return struct.unpack("H", f.read(2))[0]

def read_int8(f):
    return struct.unpack("B", f.read(1))[0]

def read_cstr(f):
    s = b''
    c = None
    while True:
        c = f.read(1)
        if len(c) == 1 and c != b'\x00':
            s += c
        else:
            break
    return s.decode("UTF-8")

def read_at(f, loc, func):
    opos = f.tell()
    f.seek(loc, os.SEEK_SET)
    res = func(f)
    f.seek(opos, os.SEEK_SET)
    return res

def parse_sfo(sf):
    """ Parse a SFO From a file io object """
    sfoKeys = {}
    
    # magic psf types
    PSF_TYPE_BIN = 0
    PSF_TYPE_STR = 2
    PSF_TYPE_VAL = 4

    magic = read_int32(sf)
    version = read_int32(sf)
    keyoff = read_int32(sf)
    valoff = read_int32(sf)
    count = read_int32(sf)
        
    if magic == 0x46535000:
        for i in range(0, count):
           nameoff = read_int16(sf)
           align = read_int8(sf)
           vtype = read_int8(sf)
           vsize = read_int32(sf)
           totalsize = read_int32(sf)
           dataoff = read_int32(sf)
    
           keylocation = keyoff + nameoff
           valuelocation = valoff + dataoff
           
           keyValue = None
           keyName = read_at(sf, keylocation, read_cstr)
           if vtype == PSF_TYPE_BIN:
               keyValue = read_at(sf, valuelocation, lambda f : f.read(vsize))
           elif vtype == PSF_TYPE_STR:
               keyValue = read_at(sf, valuelocation, read_cstr)
           elif vtype == PSF_TYPE_VAL:
               keyValue = read_at(sf, valuelocation, read_int32)
           else:
               #print("Unknown value type: "+ str(vtype))
               continue
               
           sfoKeys[keyName] = keyValue
    return sfoKeys
 
def download_vpk(url):
    """ Create bytesIO object from the url download """
    r = s.get(url)
    if r.status_code == 200:
        return io.BytesIO(r.content)
    else:
        return None


def get_params(vpkfile):
    """ Parse param.sfo file within """
    PARAM_FILE = "sce_sys/param.sfo"
    try:
        with zipfile.ZipFile(vpkfile) as zf:
            if PARAM_FILE in zf.namelist():
                with zf.open(PARAM_FILE, "r") as paramfile:
                    params = parse_sfo(paramfile)
                    return params
            else:
                print("Could not find param.sfo!")
                return None
    except Exception as e:
        print("Got exception: "+str(e))
        return None

def get_icon(vpkfile):
    """ Extract icon from vpk """
    ICON_FILE = "sce_sys/icon0.png"
    try:
        with zipfile.ZipFile(vpkfile) as zf:
            if ICON_FILE in zf.namelist():
                with zf.open(ICON_FILE, "r") as iconfile:
                    return iconfile.read()
            else:
                return None
    except:
        return None

def input_w_default(msg, default):
    val = input(msg + " [" + default + "] ")
    if val is None or val == "":
        return default
    return val
def menu():
    """ Interactive menu to add new things """
    listings = json.loads(open("listings.json", "rb").read())
    hbUrl = input_w_default("Enter download URL", "")
    
    print("Downloading homebrew ...")
    vpk = download_vpk(hbUrl)
    params = get_params(vpk)
    icon = get_icon(vpk)
    

    titleId = input_w_default("Enter TITLE ID", params["TITLE_ID"])
    title = input_w_default("Enter TITLE", params["TITLE"])
    author = input_w_default("Enter AUTHOR", "")
    version = input_w_default("Enter VERISON", params["APP_VER"])
    platform = input_w_default("Enter PLATFORM", "PS Vita")
    categories = input_w_default("Enter CATEGORIES", "").split(",")
    dataFileUrl = input_w_default("Enter Data File URL", "")
    
    
    newEntry = {
        "title": title,
        "titleid": titleId,
        "version": version,
        "author": author,
        "platform": platform,
        "category": categories,
        "externaldl": True,
        "download": hbUrl,
        "datafiles": False
    }
    
    if dataFileUrl != "":
        newEntry["datafiles"] = True
        newEntry["externaldf"] = dataFileUrl
    
    if icon is not None:
        open("icons/"+titleId+".png", "wb").write(icon)
    
    listings.append(newEntry)
    open("listings.json", "wb").write(json.dumps(listings, indent=4).encode("UTF-8"))
    
if __name__ == "__main__":
    menu()