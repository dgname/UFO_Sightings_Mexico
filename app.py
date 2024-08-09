from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Path to the CSV file
CSV_FILE_PATH = os.path.join('RESOURCES', 'mexico_sightings_with_coordinates.csv')

@app.route("/")
def take_me_to_map():
    return render_template('index.html')

@app.route("/spanish")
def take_me_to_spanish():
    return render_template('index_esp.html')

@app.route('/api')
def api():
    try:
        # Read data from the CSV file
        df = pd.read_csv(CSV_FILE_PATH)
        # Select relevant columns
        dfgroup = df[['Occurred', 'City', 'State_x', 'Country', 'Shape', 'Summary', 'Link', 'Lat', 'Lng']]
        # Convert the DataFrame to JSON
        return dfgroup.to_json(orient='records')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)


