# Karakuri Puppet - Beta

Remote control & audio forwarding server with HTML5 based client.

Server only runs on Windows 7+. Any modern browsers can be the client.

## Feature

HTML5 based client, no more installation needed.

Use websocket and MSE to process audio data on the fly.

## Usage

### Server

Download server [here](https://github.com/arition/KarakuriPuppet/releases/latest).

On your computer, run:

```
KarakuriPuppet.exe --port 8888 --token <Your token>
```

### Client

Visit [http://kp.lolipush.tk](http://kp.lolipush.tk) to use the client.

Note: You must visit the link in HTTP, not in HTTPS. If you use HTTPS, the browser will force to use encrypted websocket, which cannot be done for this project (You cannot apply a cert for a local service).

## Limitation

Audio forwarding is not supported on iOS since mobile safari does not support media source extension.

## TODO

More robust audio encoding method using ffmpeg

Low latency iOS & Android client