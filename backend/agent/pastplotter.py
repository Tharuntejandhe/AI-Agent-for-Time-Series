import matplotlib.pyplot as plt
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
csv_path = "../files/boost.csv"

def plot_decompose(decompose_result):
    fig, (ax1,ax2,ax3,ax4) = plt.subplots(4,1,figsize=(12,20))
    decompose_result.observed.plot(legend=False,ax=ax1,fontsize = 20,grid=True,linewidth = 3)
    ax1.set_ylabel("Observed",fontsize = 20)
    decompose_result.trend.plot(legend=False,ax=ax2,fontsize = 20,grid=True,linewidth = 3)
    ax2.set_ylabel("Trend",fontsize = 20)
    decompose_result.seasonal.plot(legend=False,ax=ax3,fontsize = 20,grid=True,linewidth = 3)
    ax3.set_ylabel("Seasonal",fontsize = 20)
    decompose_result.resid.plot(legend=False,ax=ax4,fontsize = 20,grid=True,linewidth = 3)
    ax4.set_ylabel("Residual",fontsize = 20)
    plt.savefig("decompose_plot.png", dpi=300, bbox_inches='tight')
df = pd.read_csv(csv_path, parse_dates=['Month'], index_col='Month')
decomposition = seasonal_decompose(df['Passengers'], period=12)
plot_decompose(decomposition)


def future_plot(x,new_predict,df,train_window):
    plt.figure(figsize=(12,5))
    plt.title('Month vs Passenger',fontsize = 20)
    plt.ylabel('Total Passengers',fontsize = 20)
    plt.xlabel('Months',fontsize = 20)
    plt.grid(True)
    plt.autoscale(axis='x',tight=True)
    plt.xticks(fontsize=20)
    plt.yticks(fontsize=20)
    plt.plot(new_predict)
    plt.legend(fontsize=20)
    plt.savefig("future_plot.png", dpi=300, bbox_inches='tight')
    
def plot_prophet(m, forecast):
    fig2 = m.plot_components(forecast)
    plt.show()
    from prophet.plot import plot_plotly, plot_components_plotly
    import plotly.io as pio
    pio.renderers.default = "browser"

    fig1 = plot_plotly(m, forecast)
    fig1.show()  # <-- Required to display plot outside notebooks
    try:
        fig1.write_html("forecast.html")
        print("File saved.")
    except Exception as e:
        print("Error while saving:", e)

    # You can now double-click this file to open it in your browser manually

    # Plot components
    fig2 = plot_components_plotly(m, forecast)
    fig2.show()