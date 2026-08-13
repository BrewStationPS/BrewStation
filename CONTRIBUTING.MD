To add your own homebrew(s) to BrewStation, modify `listings.json` by following this schema:
```json
     {
        "title": "Your title here",
        "titleid": "TLID9CHAR",
        "version": "Your homebrew version here",
        "author": "The author",
        "platform": "PS Vita/PS3/PSP",
        "category": "The category of your homebrew here",
        "externaldl": true, //optional
        "download": "Your download link to the homebrew",
        "datafiles": true, //if your homebrew has data files, optional
        "downloaddf": "download link to the data files if you have it externally, optional"
    }
```
