import React from 'react';
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

export default InvoiceLine;
