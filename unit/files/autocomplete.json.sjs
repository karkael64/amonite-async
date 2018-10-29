module.exports = async function () {

    let result = null;
    await new Promise(function (resolve) {
        setTimeout(function () {
            result = {
                "list": [
                    "Jean Marc",
                    "Marc Antoine",
                    "Jean Simon",
                    "Jean Pierre",
                    "Jean Luc",
                    "Jean Jean",
                    "Joshua"
                ],
                "marks": [
                    [
                        {
                            "match": false,
                            "text": "Jean Marc"
                        }
                    ],
                    [
                        {
                            "match": false,
                            "text": "Mar"
                        },
                        {
                            "match": true,
                            "text": "c Ant"
                        },
                        {
                            "match": false,
                            "text": "oine"
                        }
                    ],
                    [
                        {
                            "match": false,
                            "text": "Jean Simon"
                        }
                    ],
                    [
                        {
                            "match": false,
                            "text": "Jean Pierre"
                        }
                    ],
                    [
                        {
                            "match": false,
                            "text": "J"
                        },
                        {
                            "match": true,
                            "text": "ea"
                        },
                        {
                            "match": false,
                            "text": "n Luc"
                        }
                    ],
                    [
                        {
                            "match": false,
                            "text": "Jean Jean"
                        }
                    ],
                    [
                        {
                            "match": true,
                            "text": "Joshua"
                        }
                    ]
                ]
            };
            resolve();
        }, 1000);
    });

    return JSON.stringify(result, false, 2);
};
