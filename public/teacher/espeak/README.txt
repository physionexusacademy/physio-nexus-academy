Built-in male reading voice for Physio Nexus Academy
====================================================

This folder holds eSpeak NG, a free, open-source speech synthesiser, compiled to JavaScript. It runs inside the visitor's browser
(nothing is sent anywhere) and gives Dr. Sajjad the same male voice on every phone and computer, without waiting for a download
from a speech service.

  espeak-ng.js          eSpeak NG compiled to JavaScript (npm package @echogarden/espeak-ng-emscripten 0.3.5), with its list of data
                        files reduced to the ones used here
  espeak-ng-data.json   the matching data (English, Hindi, Urdu rules, phonemes, male voice variants m1-m8). It is a binary file
                        named .json only so that Cloudflare compresses it in transit
  worker.js             the small Web Worker that runs it (PNA's own code)
  LICENSE.txt           GNU General Public License, version 3

eSpeak NG is (c) its authors, licensed under the GNU GPL v3 or later. Source code:
  https://github.com/espeak-ng/espeak-ng            (eSpeak NG)
  https://github.com/echogarden-project/espeak-ng-emscripten   (the JavaScript build)
No female voice variant is included. The files were produced by scripts/espeak/build.py in the website repository; apart from the
reduced data list and the data file name, they are unmodified.
