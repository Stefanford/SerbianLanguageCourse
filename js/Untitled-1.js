

.controller('AppCtrl', function($scope, $mdToast) {
  var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

  $scope.toastPosition = angular.extend({},last);

  $scope.getToastPosition = function() {
    sanitizePosition();

    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  function sanitizePosition() {
    var current = $scope.toastPosition;

    if ( current.bottom && last.top ) current.top = false;
    if ( current.top && last.bottom ) current.bottom = false;
    if ( current.right && last.left ) current.left = false;
    if ( current.left && last.right ) current.right = false;

    last = angular.extend({},current);
  }

  $scope.showSimpleToast = function() {
    var pinTo = $scope.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent('Simple Toast!')
        .position(pinTo )
        .hideDelay(3000)
    );
  };

  $scope.showActionToast = function() {
    var pinTo = $scope.getToastPosition();
    var toast = $mdToast.simple()
      .textContent('Marked as read')
      .action('UNDO')
      .highlightAction(true)
      .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
      .position(pinTo);

    $mdToast.show(toast).then(function(response) {
      if ( response == 'ok' ) {
        alert('You clicked the \'UNDO\' action.');
      }
    });
  };

})

.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});








<div layout-fill layout="column" class="inset" ng-cloak paddi>
    

    <div layout="row" layout-align="space-around">
      <div style="width:50px"></div>
      <md-button ng-click="showSimpleToast()">
        Show Simple
      </md-button>
      <md-button class="md-raised" ng-click="showActionToast()">
        Show With Action
      </md-button>
      <div style="width:50px"></div>
    </div>

    <div layout="row" id="toastBounds">

      <div>
        <p><b>Toast Position: "{{getToastPosition()}}"</b></p>
        <md-checkbox ng-repeat="(name, isSelected) in toastPosition"
          ng-model="toastPosition[name]">
          {{name}}
        </md-checkbox>
      </div>
    </div>
    <div layout="row">
      <md-button class="md-primary md-fab md-fab-bottom-right">
        FAB
      </md-button>
      <md-button class="md-accent md-fab md-fab-top-right">
        FAB
      </md-button>

    </div>
</div>