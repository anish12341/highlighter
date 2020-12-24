# Environment setup instruction
* General external library installations
    * Install NodeJS (Version 12 or up)
    * Verify NodeJS installations by typing following command in cmd/terminal
        * ```node --version```
    * Install and verify npm installation by typing following command in cmd/terminal
        * ```npm``` 
    * Note: After installation, both of the above command should not say that ```node``` or ```npm``` commands are not recognized. If commands say that this means that they are not installed correctly.
* Fork ```highlighter``` repo after Anish add you as a contributor.
    * You will be able to fork the repo from Github website.
    * Go to https://github.com/anish12341/highlighter
    * You should see ```fork``` button besides ```star``` button.
    * After forking, you will be able to see the new copy of this repo in your account's repository.
* Clone your newly created repo copy to your local machine.
    * You can use any Git GUI for this.
* Project specific installations
    * Installations for Chrome extension code
        * In terminal/cmd, go to a file location where Git repo is cloned 
        * Go to highlighter/highligher-frontend/
        * Type the following command ```npm install```. It will install all the dependencies listed in ```package.json``` file.
        * You also need to install grunt-cli using following command. ```npm install -g grunt-cli```
        * After this, you need to start grunt tasks using following command ```grunt watch```. Ask Anish for more information about what Grunt tasks are.
        * After starting Grunt tasks, cmd/terminal should say.
            ```
            Running "watch" task
            Waiting...
            ```
            and also it should stay like this.
        * You need to start Grunt tasks everytime you want to work on Chrome extension's code. Essentially, everything inside highlighter/highlighter-frontend/
    * Installations for Backend code (Server)
        * Open another cmd/terminal window
        * In terminal/cmd, go to a file location where Git repo is cloned 
        * Go to highlighter/highligher-backend/highlighter
        * Type the following command ```npm install```. It will install all the dependencies listed in ```package.json``` file.
        * You need to create ```.env``` file at the location of /highlighter/highlighter-backend/highlighter which will hold all the passwords necessary for the applicatio to work. Database, Gmail etc.
        * Ask Anish what to put inside ```.env``` file.
        * After that, stay at the same location highlighter/highlighter-backend/highlighter and type ```nodemon ./bin/www```
        * This will start the Express server. Check this by going to ```http://127.0.0.1:3000/users/login``` in your browser.
* Load chrome extension in your Chrome browser.
    * Open chrome browser
    * Click on 3 dots on top right corner> More Tools > Extensions
    * Enable developer mode from top right corner.
    * Click on ```Load Unpacked``` from top left.
    * It will ask you to select folder that you want to load.
    * Go to file location where project is setup then go to /highlighter/highlihgter-frontend/extension.
    * You want to load the whole ```extension``` folder.
        
* ToDo: Figure out instructions for Mac.