
# Import the os module, for the os.walk function
import os

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify

app = Flask(__name__)

# Set the directory you want to start from

rootDir = 'D:\Web\Web site'
for dirName, subdirList, fileList in os.walk(rootDir):
    print('Found directory: %s' % dirName)
    for fname in fileList:
        print('\t%s' % fname)

# Setup a route to edit data before writing to database

@app.route('/')
def Photo Data Editor():
# Set the directory you want to start from

    rootDir = 'D:\Web\Web site'
    for dirName, subdirList, fileList in os.walk(rootDir):
#        print('Found directory: %s' % dirName)
        for fname in fileList:
            if fname.find('.jpg') or fname.find('.bmp');
                dirSplit = dirName.split('\\');
                return render_template('editor.html', dirSplit = dirSplit, fileList = fileList)

# Start the application

if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run(host='0.0.0.0', port=4500)
