angular.module('sweaApp', ['ngRoute'])
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
	.controller('globalCtrl', function ($scope, $window) {
		$scope.show = false;
		$scope.genCertificate = function () {
			$scope.show = true;
		};
		$scope.reloadRoute = function () {
			$window.location.reload();
		}
	});
angular.module('sweaApp')
	.controller('certificateCtrl', function ($scope) {});
