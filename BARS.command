#!/bin/bash

cd -- "$(dirname "$BASH_SOURCE")"

# set up BARS environment
source venv/bin/activate

pip3 install -r requirements-osx.txt

# run BARS
nohup python3 bars.py > my.log 2>&1 &
echo $! > save_pid.txt

echo "Loading BARS and opening up your browser..."
sleep 1
open http://localhost:8080

# cycle for quitting BARS
while true; do
    printf "\n"
    read -p "Do you wish to quit BARS? (y or n) - " yn
    case $yn in
        [Yy]* ) \
            kill `cat save_pid.txt`; \
            rm save_pid.txt; \
            deactivate; \
            echo "Quitting BARS now. See you later!";
            break;;

        [Nn]* ) echo "Okay, BARS will stay open.";;
        * ) echo "Please type 'y' or 'n'";;
    esac
done

printf "\n"
