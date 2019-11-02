## node-gyp error resolution

npm install --global --production windows-build-tools
npm install --global node-gyp
setx PYTHON "%USERPROFILE%\.windows-build-tools\python27\python.exe"
npm config set python python2.7 --global
npm config set python C:\Python27\python.exe --global
npm config set msvs_version 2015 --global
set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V140
