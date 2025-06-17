import pandas as pd
import mysql.connector
from mysql.connector import Error

def get_past_data():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='my_database',
            user='Mukesh',
            password='1234'
        )
        query = "SELECT Month, Passengers FROM boost ORDER BY Month"
        df = pd.read_sql(query, connection)
        return df
    except Error as e:
        print(f"Error: {e}")
        return pd.DataFrame()
    finally:
        if connection.is_connected():
            connection.close()
print(get_past_data())