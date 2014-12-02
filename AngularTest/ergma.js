(function () {
	// Module variables.
	var hostedImagesPrefix = "http://127.0.0.1:10000/devstoreaccount1/userdata/";
	var selectedLanguageID = 1;

	var app = angular
		.module("ergma", []);

	// Exposed services to modules. 
	app.provider("ergmaContext", function () {

		var service = {
			getSelectedLanguageID: function () {
				return selectedLanguageID;
			},

			setSelectedLanguageID: function (value) {
				selectedLanguageID = value;
				//$rootScope.$digest(); // How to obtain/inject $rootScope here?
			}
		}

		this.getHostedImagesPrefix = function () {
			return hostedImagesPrefix;
		};

		this.setHostedImagesPrefix = function (value) {
			hostedImagesPrefix = value;
		};

		this.$get = function () { return service; };

	});

	// Multilingual functions.
	function getPreferredLiteral(multilingual) {

		if (!multilingual) return null;

		var literals = multilingual.Literals;

		var defaultLiteral = null;

		for (i = 0; i < literals.length; i++) {
			literal = literals[i];

			if (literal.LanguageID == selectedLanguageID) return literal;

			if (literal.IsDefault)
				defaultLiteral = literal;
			else if (literal === null)
				defaultLiteral = literal;
		}

		return defaultLiteral;
	}

	function getPreferredLiteralText(multilingual) {
		var literal = getPreferredLiteral(multilingual);

		if (literal != null)
			return literal.Text
		else
			return "";
	}

	function setPreferredLiteralText(multilingual, text) {
		if (text == null) return multilingual;

		if (!multilingual) {
			multilingual = {
				Literals: []
			}
		}

		var literals = multilingual.Literals;
		if (!literals) {
			literals = [];
			multilingual.Literals = literals;
		}

		var foundExistingLiteral = false;

		for (i = 0; i < literals.length; i++) {
			var literal = literals[i];

			if (literal.LanguageID == selectedLanguageID) {
				literal.Text = text;
				literal.IsDefault = true;
				foundExistingLiteral = true;
			}
			else {
				literal.IsDefault = false;
			}
		}

		if (!foundExistingLiteral) {
			literals.push({ LanguageID: selectedLanguageID, Text: text, IsDefault: true });
		}

		return multilingual;
	}

	// Showcase functions
	function getDefaultItemOfShowcase(showcase) {
		var defaultItem = showcase.DefaultItem;

		if (!defaultItem && showcase.Items.length > 0) defaultItem = showcase.Items[0];

		return defaultItem;
	}

	// Directives definitions.
	app.directive("ergmaFile", function () {
		return {
			restrict: "E",
			templateUrl: "File.html",
			scope: {
				file: "=file",
				clazz: "@fileClass",
				style: "@fileStyle"
			},
			controller: ["$scope", "$sce", function ($scope, $sce) {
				$scope.prefix = hostedImagesPrefix;

				$scope.embedCode = null;

				$scope.$watch("file", function (newFile, oldFile) {
					if (newFile && newFile.EmbedCode) {
						$scope.embedCode = $sce.trustAsHtml(newFile.EmbedCode);
					}
				});
			}]
		};
	});

	app.directive("ergmaMultilingualBind", function () {
		return {
			restrict: "A",
			template: "{{text}}",
			scope: {
				field: "=ergmaMultilingualBind"
			},
			controller: ["$scope", function ($scope) {
				$scope.text = getPreferredLiteralText($scope.field);

				$scope.$watch("field", function (newMultilingual) {
					$scope.text = getPreferredLiteralText(newMultilingual);
				},
				true);
			}]
		};
	});

	app.directive("ergmaMultilingualModel", function () {
		return {
			restrict: "A",
			scope: {
				field: "=ergmaMultilingualModel"
			},
			link: function (scope, element, attributes) {

				element.on("change keyup", function () {
					var multilingual = scope.field;
					scope.field = setPreferredLiteralText(multilingual, element.val());
					//scope.$root.$digest(); // Use the following instead.
					scope.$applyAsync("field");
				});

				scope.$watch("field", function (multilingual) {
					var text = getPreferredLiteralText(multilingual);
					if (element.val() != text) element.val(text);
				},
				true);
			}
		};
	});

	app.directive("ergmaShowcaseThumbnail", function () {
		return {
			restrict: "E",
			templateUrl: "ShowcaseThumbnail.html",
			scope: {
				showcase: "=",
				thumbnailClass: "@",
				thumbnailStyle: "@"
			},
			controller: ["$scope", function ($scope) {
				var showcase = $scope.showcase;

				if (showcase) {
					$scope.defaultItem = getDefaultItemOfShowcase(showcase);
				}
			}]
		}
	});

	app.directive("ergmaShowcaseItemThumbnail", function () {
		return {
			restrict: "E",
			templateUrl: "ShowcaseItemThumbnail.html",
			scope: {
				item: "=item"
			}
		}
	});

})();