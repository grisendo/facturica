const electron = require('electron');
const ejs = require('ejs');
const pdf = require('html-pdf');
const config = require('electron-json-config');
const smalltalk = require('smalltalk');
const axios = require('axios');

window.apiBaseUrl = 'https://api.cuentica.com/';
window.apiToken = config.get('cuenticaAPIToken');
window.currentTemplate = config.get('template', 'default');
config.set('template', window.currentTemplate);
electron.ipcRenderer.send('updateMenu', window.currentTemplate);
window.ajaxConfig = {
  headers: {'X-AUTH-TOKEN': window.apiToken}
};

window.askForAPIToken = function() {
  smalltalk.prompt('API Token', 'Insert here your Cuentica API token', window.apiToken).then(
    function(value) {
      config.set('cuenticaAPIToken', value);
      window.apiToken = config.get('cuenticaAPIToken');
      window.ajaxConfig = {
        headers: {'X-AUTH-TOKEN': window.apiToken}
      };
      if (!value) {
        config.set('cuenticaAPIToken', '');
        window.askForAPIToken();
      } else {
        axios.get(
          window.apiBaseUrl + 'company',
          window.ajaxConfig
        ).then(
          function(res) {
            electron.remote.getCurrentWindow().reload();
          },
          function() {
            electron.remote.dialog.showMessageBox(
              {
                type: 'error',
                message: 'Invalid API token',
                buttons: ['OK']
              }
            );
            config.set('cuenticaAPIToken', '');
            window.askForAPIToken();
          }
        );
      }
    },
    function() {
      if (!config.get('cuenticaAPIToken')) {
        window.askForAPIToken();
      }
    }
  );
};

electron.ipcRenderer.on('changeAPIKey', function() {
  window.askForAPIToken();
});

electron.ipcRenderer.on('changeTemplate', function(e, template) {
  window.currentTemplate = template;
  config.set('template', template);
  electron.ipcRenderer.send('updateMenu', template);
});

if (!window.apiToken) {
  window.askForAPIToken();
}

window.generatePDF = function(invoice) {
  const templateData = {
    invoice: invoice,
    path: electron.remote.app.getAppPath(),
    templatePath: electron.remote.app.getAppPath() + '/templates/' + window.currentTemplate + '/'
  };
  const pdfConfig = {
	  format: 'A4',
	  orientation: 'portrait',
	  type: 'pdf'
  };
  const dialog = electron.remote.dialog;
  dialog.showSaveDialog(
    {
      title: 'Save invoice as...',
      defaultPath: invoice.invoice_serie + '-' + invoice.invoice_number + '.pdf',
      filters: [
        {
          name: 'Portable Document Format (*.pdf)',
          extensions: ['pdf']
        },
        {
          name: 'All files',
          extensions: ['*']
        }
      ]
    },
    function(filepath) {
      if (filepath) {
        ejs.renderFile('./templates/' + window.currentTemplate + '/template.ejs', templateData, {}, function(err, html) {
          if (err) {
            dialog.showMessageBox(
              {
                type: 'error',
                message: 'Error creating invoice: ' + err,
                buttons: ['OK']
              }
            );
          } else {
            pdf.create(html, pdfConfig).toFile(filepath, function(err, res){
              dialog.showMessageBox(
                {
                  type: 'info',
                  message: 'Invoice created successfully at ' + res.filename,
                  buttons: ['OK']
                }
              );
            });
          }
        });
      }
    }
  );
};

