(function () {
	var apiHost = "https://futurvention.azurewebsites.net";

	var app = angular
		.module("showcases", ["ergma"]);

	app.config(["ergmaContextProvider", function (ergmaContext) {
		ergmaContext.setHostedImagesPrefix("https://ergmaimages.blob.core.windows.net/userdata/");
	}]);

	var requestOptions = {
		withCredentials: true
	};

	app.controller("SelfController", ["$scope", "$http", function ($scope, $http) {

		$http.get(apiHost + "/api/Self?expand=Avatar", requestOptions)
		.success(function (data, status) {
			$scope.self = data;
		})
		.error(function (data, status) {
			window.alert(data.Message);
		});

	}]);

	app.controller("ShowcasesController", ["$scope", "$http", function ($scope, $http) {

		$http.get(
			apiHost + "/api/SellerManagement/Profiles/OwnProfile/Showcases?expand=Items/File,Items/Thumbnail,Title/Literals,Description/Literals",
			requestOptions)
		.success(function (data, status) {
			listItems = [];
			for (i = 0; i < data.length; i++) {
				listItems.push({ showcase: data[i], isSelected: false })
			}
			$scope.listItems = listItems;
		})
		.error(function (data, status) {
			window.alert(data.Message);
		});

		$scope.selectedListItem = null;

		$scope.setSelectedListItem = function (listItem) {
			if ($scope.selectedListItem) $scope.selectedListItem.isSelected = false;
			$scope.selectedListItem = listItem;
			listItem.isSelected = true;
		}

		$scope.saveShowcase = function (listItem) {
			$http.patch(
				apiHost + "/api/SellerManagement/Profiles/OwnProfile/Showcases/" + listItem.showcase.ID,
				listItem.showcase,
				requestOptions)
			.success(function (data, status) {
				listItem.showcase = data;

				window.alert("Showcase was saved successfully.");
			})
			.error(function (data, status) {
				window.alert(data.Message);
			});
		}

	}]);

})();