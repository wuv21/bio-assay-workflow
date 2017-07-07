source venv/bin/activate
nohup python bars.py &

sleep 2
open http://localhost:8080

echo "Please type 'quit' to quit BARS"
select yn in "quit"; do
    case $yn in \
        quit ) export BARSPROCESS=$(ps -A | grep ' python bars.py$' | awk '{print $1}'); kill $BARSPROCESS; deactivate; break;;
    esac
done