#!/bin/bash

cd -- "$(dirname "$BASH_SOURCE")"

# set up BARS environment
source venv/bin/activate

pip install -r requirements-osx.txt

# kill any existing instances of BARS
export BARSPROCESS=$(ps -A | grep ' python bars.py$' | awk '{print $1}');
kill $BARSPROCESS;

# run BARS
nohup python bars.py &

echo "Loading BARS and opening up your browser..."
sleep 1
open http://localhost:8080

# cycle for quitting BARS
while true; do
    printf "\n"
    read -p "Do you wish to quit BARS? (y or n) - " yn
    case $yn in
        [Yy]* ) \
            export BARSPROCESS=$(ps -A | grep ' python bars.py$' | awk '{print $1}'); \
            kill $BARSPROCESS; \
            deactivate; \
            echo "Quitting BARS now. See you later!";
            break;;

        [Nn]* ) echo "Okay, BARS will stay open.";;
        * ) echo "Please type 'y' or 'n'";;
    esac
done

printf "\n"
