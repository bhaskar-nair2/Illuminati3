angular.module('sweaApp', ['ngRoute'])
	.config(function ($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist(['**']);
	})
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				redirectTo: '/certificate'
			})
			.when('/certificate', {
				templateUrl: 'pages/certificate.html',
				controller: 'certificateCtrl'
			})
			.otherwise({
				redirectTo: '/certificate'
			});
	});


// Global Controller
angular.module('sweaApp')
	.controller('globalCtrl', function ($scope, $window, $http) {
		$scope.show = false;
		$scope.genCertificate = function (x) {
			$scope.url = 'https://illuminati.optimuscp.io/?regno=' + x
			$scope.show = true;
		};
		$scope.reloadRoute = function () {
			$window.location.reload();
		}
	});
angular.module('sweaApp')
	.controller('certificateCtrl', function ($scope) {});
