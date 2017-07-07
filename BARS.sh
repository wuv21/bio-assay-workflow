source venv/bin/activate
nohup python bars.py &

echo "Loading BARS and opening up your browser..."
sleep 1
open http://localhost:8080

while true; do
    printf "\n"
    read -p "Do you wish to quit BARS? (y or n) - " yn
    case $yn in
        [Yy]* ) \
            export BARSPROCESS=$(ps -A | grep ' python bars.py$' | awk '{print $1}'); \
            kill $BARSPROCESS; \
            deactivate; \
            echo "Quitting BARS now. See you later!"
            break;;

        [Nn]* ) echo "Okay, BARS will stay open.";;
        * ) echo "Please type 'y' or 'n'";;
    esac
done