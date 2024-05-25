This application is a very sophisticated flash card API meant for rote memorizing facts. All you need to do in order to run it is provide the files german.json and spanish.json in the root directory(not the client directory) which should be a JSON file containing an array of objects with the fields ID, word, and meaning filled in.

```json
[
    {
        "ID": "any string unique identifier",
        "word": "la escuela",
        "meaning": "school"
    },
    ...
]
```

Once you've supplied a word list, simply run

```
node .
```

and navigate to localhost:255
