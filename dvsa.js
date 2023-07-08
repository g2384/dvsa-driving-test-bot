// ==UserScript==
// @name         dvsa-driving-test-bot
// @namespace    https://github.com/g2384/dvsa-driving-test-bot/
// @version      0.1
// @description  auto-refresh
// @author       g2384
// @match        https://driverpracticaltest.dvsa.gov.uk/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("DVSA user script loaded.");
    const driving_licence_number = "<your driving licence>";
    const driving_licence_number_short = "<the short version>"; // for changing booking
    const driving_test_reference_number = "<test reference number>"; // optional
    const test_centre_location = "<your postcode>";
    const refresh_every_seconds_min = 20;
    const refresh_every_seconds_max = 45;
    const test_centre_id = "<an id here>"; // an integer

    var urlParams;
    (window.onpopstate = function() {
        var match,
            pl = /\+/g, // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function(s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            query = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
    })();

    function generateRandom(min = 0, max = 100) {
        let difference = max - min;
        let rand = Math.random();
        rand = Math.floor( rand * difference);
        rand = rand + min;
        return rand;
    }

    function sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }

    function getElementInnerText(query, tryCount) {
        var centerName = document.querySelector(query)?.innerText;
        var trial = 0;
        console.log('query "' + query + '": ' + centerName);
        while (centerName == undefined || centerName == null) {
            sleep(200).then(() => {
                console.log("wait 200ms.")
            });
            centerName = document.querySelector(query)?.innerText;
            console.log('trying ' + trial);
            trial++;
            if (trial >= tryCount) {
                return centerName ?? "";
            }
        }
        return centerName ?? "";
    }

    function getCurrentDate() {
        const today = new Date();
        const yyyy = today.getFullYear().toString().substr(-2);
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const formattedToday = dd + '/' + mm + '/' + yyyy;
        return formattedToday;
    }

    function getCurrentTime(date) {
        var h = date.getHours().toString();
        var m = date.getMinutes().toString();
        var s = date.getSeconds().toString();
        if (h.length <= 1) {
            h = '0' + h;
        }
        if (m.length <= 1) {
            m = '0' + m;
        }
        if (s.length <= 1) {
            s = '0' + s;
        }
        var time = h + ":" + m + ":" + s;
        return time;
    }

    function reloadPage(refresh_every_seconds_min, refresh_every_seconds_max, searchResultEle, reload){
        var refresh_every_seconds = generateRandom(refresh_every_seconds_min, refresh_every_seconds_max);
        var today = new Date();
        var time = getCurrentTime(today);
        var text = searchResultEle.innerText;
        today.setSeconds(today.getSeconds() + refresh_every_seconds);
        var nextTime = getCurrentTime(today);
        searchResultEle.innerText = text + ' (as of: ' + time + ', next refresh time: ' + nextTime + ')';
        var alrtSound2 = new Audio("data:audio/mpeg;base64,SUQzBAAAAAAleFRDT04AAAAHAAADQmx1ZXMAUFJJVgAAJTsAAFhNUAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA3LjEtYzAwMCA3OS5iMGY4YmU5LCAyMDIxLzEyLzA4LTE5OjExOjIyICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczp4bXBETT0iaHR0cDovL25zLmFkb2JlLmNvbS94bXAvMS4wL0R5bmFtaWNNZWRpYS8iCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDYtMjBUMTc6NTg6MTkrMDE6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTA2LTIwVDE3OjU4OjE5KzAxOjAwIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM2ODBhNGUyLTJmYmYtMTc0OS1hOGMzLTI5OGM1OGIxMTZkNyIKICAgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNjgwYTRlMi0yZmJmLTE3NDktYThjMy0yOThjNThiMTE2ZDciCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo1NTkzMzNhZi0yYTZmLTY1NDktOGRkNC1kYTBmODMxY2M4NWUiCiAgIGRjOmZvcm1hdD0iYXVkaW8vbXBlZyIKICAgeG1wRE06cGFydE9mQ29tcGlsYXRpb249ImZhbHNlIgogICB4bXBETTpnZW5yZT0iQmx1ZXMiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NTkzMzNhZi0yYTZmLTY1NDktOGRkNC1kYTBmODMxY2M4NWUiCiAgICAgIHN0RXZ0OndoZW49IjIwMjMtMDYtMDdUMTg6MTk6NDArMDE6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEF1ZGl0aW9uIDIyLjUgKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvbWV0YWRhdGEiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MzY0NTY2ODktNzM3Yy1iNzRmLThjYzctNGI3OTViNzEyYmI5IgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTA2LTA3VDE4OjE5OjQwKzAxOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBdWRpdGlvbiAyMi41IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4ZjUwOTAyMC0wYTdhLWM3NDEtYTEwZS04MjVkZTc0ZTU4NTUiCiAgICAgIHN0RXZ0OndoZW49IjIwMjMtMDYtMjBUMTc6NTg6MTkrMDE6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEF1ZGl0aW9uIDIyLjUgKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvbWV0YWRhdGEiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MzY4MGE0ZTItMmZiZi0xNzQ5LWE4YzMtMjk4YzU4YjExNmQ3IgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTA2LTIwVDE3OjU4OjE5KzAxOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBdWRpdGlvbiAyMi41IChXaW5kb3dzKSIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDx4bXBNTTpEZXJpdmVkRnJvbQogICAgc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4ZjUwOTAyMC0wYTdhLWM3NDEtYTEwZS04MjVkZTc0ZTU4NTUiCiAgICBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU1OTMzM2FmLTJhNmYtNjU0OS04ZGQ0LWRhMGY4MzFjYzg1ZSIKICAgIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo1NTkzMzNhZi0yYTZmLTY1NDktOGRkNC1kYTBmODMxY2M4NWUiLz4KICAgPHhtcERNOlRyYWNrcz4KICAgIDxyZGY6QmFnPgogICAgIDxyZGY6bGkKICAgICAgeG1wRE06dHJhY2tOYW1lPSJDdWVQb2ludCBNYXJrZXJzIgogICAgICB4bXBETTp0cmFja1R5cGU9IkN1ZSIKICAgICAgeG1wRE06ZnJhbWVSYXRlPSJmMjQwMDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHhtcERNOnRyYWNrTmFtZT0iQ0QgVHJhY2sgTWFya2VycyIKICAgICAgeG1wRE06dHJhY2tUeXBlPSJUcmFjayIKICAgICAgeG1wRE06ZnJhbWVSYXRlPSJmMjQwMDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHhtcERNOnRyYWNrTmFtZT0iU3ViY2xpcCBNYXJrZXJzIgogICAgICB4bXBETTp0cmFja1R5cGU9IkluT3V0IgogICAgICB4bXBETTpmcmFtZVJhdGU9ImYyNDAwMCIvPgogICAgPC9yZGY6QmFnPgogICA8L3htcERNOlRyYWNrcz4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PgBUU1NFAAAADgAAA0xhdmY2MC40LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAIAAADwABMTExMTExMTExMTExmZmZmZmZmZmZmZmaAgICAgICAgICAgICAmZmZmZmZmZmZmZmZs7Ozs7Ozs7Ozs7Ozs8zMzMzMzMzMzMzMzObm5ubm5ubm5ubm5ub///////////////8AAAAATGF2YzYwLjYuAAAAAAAAAAAAAAAAJAJAAAAAAAAAA8DM9Bhc//sURAAN8EUAOZgAAAgGQBagAAAAAXBs6hQRAAAWAB4CgCAAAjAAA////oyn/3/kFLwx/xj/6fo3///oI/1//0f/o9Dwqgr7gVBM8VgQPAIEP5OaP/3H7/+YPhYPLf/k//sUZA4AAPUkxgYpQAAWggiwxpQAAcQlbhjRAAA4gixTDBAAZ5O/iGDV2Ao4SPzJvA6fihHZcE/gd7/lBnUYD12KADrHrmceXBPkfxwOB+AAAGFtH9D9+cK1U9VRIhDS//sUZAMAAJsJXYZIAAANgRpgx4AAAgwjYhzwgCg1gquTmAAFYWqjHDAiLIAic3//bX8fHyphg5Pe7bfl6nGZ/8SyVxWMuyYhigDIGZCpwYYcAAATOGNqgaAr7DGS0BJp//sUZAGPcHYIVYAGeKgNIMogAZgFQjgjTgEx4qAtAyoQAqQEIjgplyYxLCao1jOjGloAIeGj/M1KqYXBH8HjRYJgiiwQ4IsXYXqhUtRvULkhCRPROGw0PDgvlZUCHYZU//sUZAMPcJAIUAAJwBgM4NpkAYkTAjAhPAAbIigshCbAB4hcjE2UGaAaxgYIfKnuA/QAAFAbjWEoscJzWFhnQXcquhNJVCLI1cBb1i3ElmtOminD+GSU8wl1feE0qNI1//sUZAMD8JAITYAgyAoM4PlQCeMlQcQhQQAx5Hg8BCNAPAyUcYIqETYAmS4adXGa6wp+niehqgPsC1YGSgIEA2uSAqPA3XSHqxuW5QwOQ06LdwaYN8RmEhx0kRQCyJMH//sUZAMP8H8HzoABeBoNoQkABY8hAggdOAAEwIAZhCUAAJiE6GUNdVAarLtGHzRx6Cp4hxEcTbys01jiEJzAICWbBIDA1EQNRMDXoZCiJi5ctSqLQYd3AITnJQqGg6DA//sUZAaP8FIIRAABMQgIwQiQACITAZAA9gAEYAA1gF1AAIwAI2oCJw1s88oOgqNyRE6d//o+rEpYiWHnTrj3+sNKh1FMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVV");
        alrtSound2.autoplay = true;
        alrtSound2.loop = false;
        if(reload){
            setTimeout(function() {
                window.location.reload();
            }, refresh_every_seconds * 1000);
        }
        else{
            setTimeout(function() {
                document.querySelector("#test-centres-submit").click();
            }, refresh_every_seconds * 1000);
        }
    }

    function alertFoundDate(){
        document.querySelector("#page").style.backgroundColor = "#9f0000";
        console.log('found date!');
        var alrtSound = new Audio("data:audio/mpeg;base64,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");
        alrtSound.autoplay = true;
        alrtSound.loop = true;
    }

    window.addEventListener('load', function() {
        var completed = document.querySelectorAll('#process-steps>li.complete');
        console.log("execution = " + urlParams.execution);
        var currentStep = completed.length + 1;
        console.log("current step = " + currentStep);
        var header = getElementInnerText("#main > div.page-header > h1", 10);
        console.log("header = " + header);
        if(header == ""){
            header = getElementInnerText("#main header h1", 10);
            console.log("header = " + header);
            // page: Short notice tests (non-refundable)
            if(header.indexOf("Short notice tests") >= 0){
                var pageContent = getElementInnerText("#short-notice-slots-search", 10);
                if(pageContent.indexOf("There are no short notice") >= 0){
                    console.log('pageContent = ' + pageContent);
                    document.querySelector("#postcode-input").value = test_centre_location;
                    var searchResultEle = document.querySelector("#main header h1");
                    reloadPage(refresh_every_seconds_min, refresh_every_seconds_max, searchResultEle, false);
                } else {
                    alertFoundDate();
                }
            }
        }
        var fieldset_legend = getElementInnerText("#main > section > form > fieldset > legend", 10);
        console.log("field legend = " + fieldset_legend);
        if (fieldset_legend.indexOf("Search by your home postcode") >= 0) {
            document.getElementById("test-centres-input").value = test_centre_location;
        } else if (window.location.href.indexOf("https://driverpracticaltest.dvsa.gov.uk/login") >= 0) {
            var header2 = getElementInnerText("#main > header > h1", 10);
            if (header2 == "Enter details below to access your booking") {
                document.getElementById("driving-licence-number").value = driving_licence_number_short;
                document.getElementById("application-reference-number").value = driving_test_reference_number;
            }
        } else if (header.indexOf('Licence details') >= 0) {
            document.getElementById("driving-licence").value = driving_licence_number;
            document.getElementById("special-needs-none").checked = true;
        } else if (fieldset_legend.indexOf('test date') >= 0) {
            var formattedToday = getCurrentDate();
            var calendar = document.getElementById("test-choice-calendar");
            if (calendar != null && calendar != undefined) {
                calendar.value = formattedToday;
            }
        } else if (urlParams.execution.match(/^e.s4$/g)) {
            document.getElementById("test-centres-input").value = test_centre_location;
        }
        if (header.indexOf('Test centre') >= 0) {
            var findTestCenterButton = document.querySelector('#test-centres-submit');
            console.log(findTestCenterButton);
            if (findTestCenterButton != undefined && findTestCenterButton != null) {
                var centerName = getElementInnerText("#centre-name-" + test_centre_id + " h4", 10);
                console.log('found ' + centerName);
                if (centerName == 'Redhill Aerodrome') {
                    var result = getElementInnerText("#centre-name-" + test_centre_id + " h5", 10);
                    if (result.toLowerCase().indexOf('no tests found on any date') >= 0) {
                        console.log('result = ' + result);
                        var searchResultEle = document.querySelector("#search-results h2");
                        reloadPage(refresh_every_seconds_min, refresh_every_seconds_max, searchResultEle, true);
                    } else {
                        alertFoundDate();
                    }
                }
            }
        }
    }, false);
})();
