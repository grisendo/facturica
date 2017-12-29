import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

class InvoiceLine extends React.Component {

  getPDF(e) {
    e.preventDefault();
    axios.get(
      window.apiBaseUrl + 'invoice/' + this.props.invoice.id,
      window.ajaxConfig
    ).then(
      function(res) {
        window.generatePDF(res.data);
      }.bind(this)
    );
    return false
  }

  render() {
    let classes = 'tabla_estado';
    if (this.props.invoice.amount_details.total_left > 0) {
      classes += ' pendiente';
    }
    return <tr className="table_row">
        <td className={ classes }></td>
        <td className="tabla_fecha first">{ this.props.invoice.date.split('-').reverse().join('/') }</td>
        <td className="tabla_numero internal">{ this.props.invoice.invoice_number }/{ this.props.invoice.invoice_serie }</td>
        <td className="tabla_razon_social internal">{ this.props.invoice.description }</td>
        <td className="tabla_ingreso text_right internal">{ this.props.invoice.amount_details.total_base.toFixed(2) }€</td>
        <td className="tabla_total_factura text_right last">
          <strong>{ this.props.invoice.amount_details.total_amount.toFixed(2) }€</strong>
        </td>
        <td className="linea_acciones">
          <a href="#" onClick={this.getPDF.bind(this)}><i className="icon-download" title="Save"></i></a>
        </td>
      </tr>
  };

}

class Invoices extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      invoices: [],
      page: 0,
      startDate: '',
      endDate: '',
      totalFrom: '',
      totalTo: '',
      query: '',
      numPages: 9999
    };
  }

  componentDidMount() {
    this.loadMore();
  };
  
  loadMoreClick(e) {
    e.preventDefault();
    this.loadMore();
    return false;
  };

  loadMore() {
    if (!window.apiToken) {
      return;
    }
    this.setState(
      { page: this.state.page + 1 },
      function() {
        axios.get(
          window.apiBaseUrl + 'invoice?page=' + this.state.page + '&sort=date:desc&page_size=10',
          window.ajaxConfig
        ).then(
          function(res) {
            const numPages = Math.ceil(res.headers['x-pagination-totalelements'] / res.headers['x-pagination-pagesize']);
            const invoices = this.state.invoices.slice(0);
            for (const invoice of res.data) {
              invoices.push(invoice);
            }
            this.setState({
              numPages: numPages,
              invoices: invoices
            });
          }.bind(this)
        );
      }
    );
  };
  
  applyFilters(event) {
    event.preventDefault();
    console.log(this);
    this.setState({
      invoices: [],
      page: 0,
      startDate: this.startDate.value,
      endDate: this.endDate.value,
      totalFrom: this.totalFrom.value,
      totalTo: this.totalTo.value,
      query: this.query.value,
      numPages: 9999
    });
    this.loadMore();
    return false;
  };

  render() {
    if (!window.apiToken) {
      return <div></div>;
    }
    const rows = this.state.invoices.map(function(invoice) {
        return <InvoiceLine key={invoice.id} invoice={invoice} />
    });
    let loadMorebutton;
    if (this.state.page < this.state.numPages) {
      loadMorebutton = <div className="vermas_tabla">
          <a href="#" id="show_more_emitidos" className="mostrarOpciones" onClick={this.loadMoreClick.bind(this)}>Load more...</a>
        </div>
    }
    return <div>
        <h2>Invoices</h2>
        {/* <div className="wider-box filtro">
          <form id="filter" onSubmit={this.applyFilters.bind(this)}>
            <div className="grid_24">
              <div className="grid_8 filter-column">
                <div className="filtro-item">
                  <div className="filtro-fecha">
                    <label htmlFor="fechaIni" className="label_mini">Start date:</label>
                    <input type="text" ref={(input) => this.startDate = input} />
                  </div>
                  <div className="filtro-fecha">
                    <label htmlFor="fechaFin" className="label_mini">Final date:</label>
                    <input type="text" ref={(input) => this.endDate = input} />
                  </div>
                </div>
              </div>
              <div className="grid_8 filter-column">
                <div className="filtro-item filtro-cliente">
                  <label htmlFor="cliente">Cliente:</label>
                  <div className="select2-container" id="s2id_cliente" />
                </div>
                <div className="filtro-item filtro-descripcion">
                  <label htmlFor="descripcion">Descripción:</label>
                  <input type="text" ref={(input) => this.query = input} />
                </div>
              </div>
              <div className="grid_8 filter-column last">
                <div className="filtro-item filtro-importe">
                  <label>Total:</label>
                  <label htmlFor="importeMin" className="label_mini">Entre</label>
                  <input type="text" ref={(input) => this.totalFrom = input} /><span className="euros">€</span>
                  <label htmlFor="importeMax" className="label_mini">y</label>
                  <input type="text" ref={(input) => this.totalTo = input} /><span className="euros">€</span>
                </div>
              </div>
              <input type="submit" value="Submit" />
            </div>
          </form>
        </div>*/}
        <div id="loading"></div>
        <div id="result">
          <table className="grid tabla_facturas">
            <thead>
              <tr>
                <th className="empty tabla_estado"></th>
                <th className="tabla_fecha first">Date</th>
                <th className="tabla_numero internal">Number</th>
                <th className="tabla_descripcion internal">Description</th>
                <th className="tabla_ingreso internal">Base</th>
                <th className="tabla_total_factura last">Total</th>
                <th className="empty"></th>
              </tr>
            </thead>
            <tbody>
              { rows }
            </tbody>
          </table>
          { loadMorebutton }
        </div>
      </div>
  };

}

ReactDOM.render(<Invoices/>, document.getElementById('root'));
