<div class="row">
  <div class="col-lg-12">
    <div class="panel panel-group">
      <form id="giphy_acp" class="form giphy-settings">
        <div class="row">
          <div class="col-lg-6 col-md-6">
            <div class="form-group">
              <div class="panel panel-primary">
                <div class="panel-heading">API Key</div>
                <div class="panel-body">
                If no API key is provided, the public API key will be used.<br/>
                Note that the public API key is only for testing use,
                using it in production will likely rate limit your whole forum.
                <input
                  id="extensions"
                  class="form-control"
                  type="text"
                  placeholder="dc6zaTOxFJmzC"
                  data-key="strings.apiKey" />
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="panel panel-primary">
              <div class="panel-heading">Giphy Control Panel</div>
              <div class="panel-body">
                <button class="btn btn-primary" id="save">Save Settings</button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <script type="text/javascript">
        require(['settings'], function(settings) {
          var wrapper = $('#giphy_acp');
          settings.sync('giphy', wrapper);
          $('#save').click(function(event) {
            event.preventDefault();
            settings.persist('giphy', wrapper, function() {
              socket.emit('admin.settings.syncGiphy');
              // TODO add confirmation
            })
          });
        });
      </script>
    </div>
  </div>
</div>
