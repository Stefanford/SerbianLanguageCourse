angular.module('app').directive('ngDropdownMultiselect', ['$filter', '$document', '$compile', '$parse',

function ($filter, $document, $compile, $parse) {
            var i = -1;
            return {
                scope: {
                    selectedModel: '=',
                    options: '=',
                    extraSettings: '=',
                    events: '=',
                    searchFilter: '=?',
                    translationTexts: '=',
                    groupBy: '@'
                },
                template: function (element, attrs) {
                    var checkboxes = attrs.checkboxes ? true : false;
                    var groups = attrs.groupBy ? true : false;

                    i++;
                    var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
                    template += '<md-button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText(' + i + ')}}&nbsp;<span class="caret"></span></md-button>';
                    template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\', width : settings.scrollable ? settings.scrollableWidth : \'auto\'}" style="overflow: scroll" >';
                    template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok"></span>  {{texts.checkAll}}</a>';
                    template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove"></span>   {{texts.uncheckAll}}</a></li>';
                    template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';

                    if (groups) {
                        template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
                        template += '<li ng-repeat-end role="presentation">';
                    } else {
                        template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
                    }
                    template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

                    if (checkboxes) {
                        template += '<div class="checkbox"><label><md-checkbox class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" > {{getPropertyForObject(option, settings.displayProp)}}</md-checkbox></label></div></a>';
                    } else {
                        template += '<span data-ng-class="{\'glyphicon glyphicon-ok\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
                    }
                    template += '</li>';
                    template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
                    template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';
                    template += '</ul>';
                    template += '</div>';
                    element.html(template);
                },
                link: function ($scope, $element, $attrs) {
                    var $dropdownTrigger = $element.children()[0];

                    $scope.toggleDropdown = function () {
                        $scope.open = !$scope.open;
                    };

                    $scope.checkboxClick = function ($event, id) {
                        $scope.setSelectedItem(id);
                        $event.stopImmediatePropagation();
                    };

                    $scope.externalEvents = {
                        onItemSelect: angular.noop,
                        onItemDeselect: angular.noop,
                        onSelectAll: angular.noop,
                        onDeselectAll: angular.noop,
                        onInitDone: angular.noop,
                        onMaxSelectionReached: angular.noop
                    };

                    $scope.settings = {
                        dynamicTitle: true,
                        scrollable: false,
                        scrollableHeight: '3px',
                        closeOnBlur: true,
                        displayProp: 'termini',
                        idProp: 'termini',
                        externalIdProp: 'termini',
                        enableSearch: false,
                        selectionLimit: 0,
                        showCheckAll: true,
                        showUncheckAll: true,
                        closeOnSelect: false,
                        buttonClasses: 'btn btn-default',
                        closeOnDeselect: false,
                        groupBy: $attrs.groupBy || undefined,
                        groupByTextProvider: null,
                        smartButtonMaxItems: 0,
                        smartButtonTextConverter: angular.noop
                    };

                    $scope.texts = {
                        checkAll: 'Štikliraj sve',
                        uncheckAll: 'Odštikliraj sve',
                        selectionOf: '/',
                        buttonDefaultText: ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', "Petak", "Subota", "Nedelja"],
                        dynamicButtonTextSuffix: 'Štikliranih'
                    };

                    $scope.searchFilter = $scope.searchFilter || '';

                    if (angular.isDefined($scope.settings.groupBy)) {
                        $scope.$watch('options', function (newValue) {
                            if (angular.isDefined(newValue)) {
                                $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                            }
                        });
                    }

                    angular.extend($scope.settings, $scope.extraSettings || []);
                    angular.extend($scope.externalEvents, $scope.events || []);
                    angular.extend($scope.texts, $scope.translationTexts);

                    $scope.singleSelection = $scope.settings.selectionLimit === 1;

                    function getFindObj(id) {
                        var findObj = {};

                        if ($scope.settings.externalIdProp === '') {
                            findObj[$scope.settings.idProp] = id;
                        } else {
                            findObj[$scope.settings.externalIdProp] = id;
                        }

                        return findObj;
                    }

                    function clearObject(object) {
                        for (var prop in object) {
                            delete object[prop];
                        }
                    }

                    if ($scope.singleSelection) {
                        if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                            clearObject($scope.selectedModel);
                        }
                    }

                    if ($scope.settings.closeOnBlur) {
                        $document.on('click', function (e) {
                            var target = e.target.parentElement;
                            var parentFound = false;

                            while (angular.isDefined(target) && target !== null && !parentFound) {
                                if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                                    if (target === $dropdownTrigger) {
                                        parentFound = true;
                                    }
                                }
                                target = target.parentElement;
                            }

                            if (!parentFound) {
                                $scope.$apply(function () {
                                    $scope.open = false;
                                });
                            }
                        });
                    }

                    $scope.getGroupTitle = function (groupValue) {
                        if ($scope.settings.groupByTextProvider !== null) {
                            return $scope.settings.groupByTextProvider(groupValue);
                        }

                        return groupValue;
                    };

                    $scope.getButtonText = function (i) {

                        $scope.dan = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', "Petak", "Subota", "Nedelja"];

                        if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                            if ($scope.settings.smartButtonMaxItems > 0) {
                                var itemsText = [];

                                angular.forEach($scope.options, function (optionItem) {
                                    if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                                        var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                                        var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                                        itemsText.push(converterResponse ? converterResponse : displayText);
                                    }
                                });

                                if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                                    itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                                    itemsText.push('...');
                                }

                                return itemsText.join(', ');
                            } else {
                                var totalSelected;

                                if ($scope.singleSelection) {
                                    totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                                } else {
                                    totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                                }

                                if (totalSelected === 0) {
                                    return $scope.texts.buttonDefaultText[i++];
                                } else {
                                    return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                                }
                            }
                        } else {


                            return $scope.texts.buttonDefaultText[i];
                        }
                    };

                    $scope.getPropertyForObject = function (object, property) {
                        if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                            return object[property];
                        }

                        return '';
                    };

                    $scope.selectAll = function () {
                        $scope.deselectAll(false);
                        $scope.externalEvents.onSelectAll();

                        angular.forEach($scope.options, function (value) {
                            $scope.setSelectedItem(value[$scope.settings.idProp], true);
                        });
                    };

                    $scope.deselectAll = function (sendEvent) {
                        sendEvent = sendEvent || true;

                        if (sendEvent) {
                            $scope.externalEvents.onDeselectAll();
                        }

                        if ($scope.singleSelection) {
                            clearObject($scope.selectedModel);
                        } else {
                            $scope.selectedModel.splice(0, $scope.selectedModel.length);
                        }
                    };

                    $scope.setSelectedItem = function (id, dontRemove) {
                        var findObj = getFindObj(id);
                        var finalObj = null;

                        if ($scope.settings.externalIdProp === '') {
                            finalObj = _.find($scope.options, findObj);
                        } else {
                            finalObj = findObj;
                        }

                        if ($scope.singleSelection) {
                            clearObject($scope.selectedModel);
                            angular.extend($scope.selectedModel, finalObj);
                            $scope.externalEvents.onItemSelect(finalObj);
                            if ($scope.settings.closeOnSelect) $scope.open = false;

                            return;
                        }

                        dontRemove = dontRemove || false;

                        var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

                        if (!dontRemove && exists) {
                            $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                            $scope.externalEvents.onItemDeselect(findObj);
                        } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                            $scope.selectedModel.push(finalObj);
                            $scope.externalEvents.onItemSelect(finalObj);
                        }
                        if ($scope.settings.closeOnSelect) $scope.open = false;
                    };

                    $scope.isChecked = function (id) {
                        if ($scope.singleSelection) {
                            return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(id)[$scope.settings.idProp];
                        }

                        return _.findIndex($scope.selectedModel, getFindObj(id)) !== -1;
                    };

                    $scope.externalEvents.onInitDone();
                }
            };
}]).factory('pitanjaService', function ($http) {
        return {
            getDataPit: function (language) {
                //alert(language);
                var url = "https://www.jasonbase.com/things/LZWL.json";
                if (language === 'eng') {
                    url = "https://api.myjson.com/bins/dgu7z"
                }
                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }
        }
    })
    .factory('odgovoriService', function ($http) {
        return {
            getDataOdg: function (language) {

                var url = "https://www.jasonbase.com/things/B1xl.json";
                if (language === 'eng') {
                    url = "https://api.myjson.com/bins/vdzj3"
                }
                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }
        }
    })


    .controller('popUp', function ($scope, $mdDialog, $rootScope, $http, $location, $routeParams, $mdToast, pitanjaService, odgovoriService) {

        $scope.prazno = false;


        $location.search('tab', "null");
        $scope.language = "";

        function processDataPit(data) {
            $scope.pitanja = data;
            $scope.dugmeNazad = $scope.pitanja.dugmici.nazad;
            $scope.dugmeNapred = $scope.pitanja.dugmici.dalje;
            $scope.brojNedelja = [];
            $scope.datumOdrzavanja = [];
            $scope.brojCasovaNedeljno = [];
            $scope.onOffCasovaNedeljno = false;
            $scope.onOffSmestaj = true;
            $scope.preskociRaspored === true;

            $rootScope.show = function (ev, adr) {
                $mdDialog.show({
                    controller: DialogFormular,
                    templateUrl: adr,
                    scope: $scope,
                    preserveScope: true,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                });
            };

            DialogFormular($scope, $mdDialog, $location);
        }

        function DialogFormular($scope, $mdDialog, $location) {
            $scope.disklejmer = 'Uslovi koriščenja:   Ograničenje odgovornosti Vi shvatate i prihvatate da sistem Donesi.kom može imati greške u funkcionisanju, projektne greške ili druge probleme i da korišćenje Servisa može rezultirati u nepredviđenoj šteti ili gubitku, uključujući, ali ne i ograničeno na, neočekivani rezultat ili gubitak podataka. Donesi.kom ni pod kakvim okolnostima neće biti odgovoran za bilo kakve nastale štete (uključujući, ali ne i ograničeno na, specijalne, nenamerne ili namerne štete, gubitak profita ili gubitak podataka, bez obzira na predvidljivost takvih šteta) proistekle iz ili povezane sa korišćenjem ili performansama sistema Donesi.kom ili bilo kakvim materijalima ili servisima koje Vam Donesi.kom nudi. Ograničenje odgovornosti se primenjuje u smislu štete zbog drugih informacija, servisa, usluga, saveta ili proizvoda do kojih se došlo pomoću linkova ili reklama na sistemu Donesi.kom. Ni pod kojim uslovima Donesi.kom nije odgovoran za nepravilno funkcionisanje ili prekid rada sistema Donesi.kom, prouzrokovano direktno ili indirektno prirodnim silama, elementarnim nepogodama ili uzrocima koji su van razumne moći kontrole, u šta spadaju, ali ne i ograničeno na, problemi u funkcionisanju interneta, kvarovi na kompjuterskoj opremi ili problemi sa istom, problemi u funkcionisanju telekomunikacione opreme ili mreže ili neke druge vrste uređaja i opreme, nestanci struje, bolesti zaposlenih, nesaradnja trećih lica, sve vrste društvenih previranja, naredbe domaćih i međunarodnih sudova.'

            var last = {
                bottom: false,
                top: true,
                left: false,
                right: true
            };

            $scope.toastPosition = angular.extend({}, last);

            $scope.getToastPosition = function () {
                sanitizePosition();

                return Object.keys($scope.toastPosition)
                    .filter(function (pos) {
                        return $scope.toastPosition[pos];
                    })
                    .join(' ');
            };

            function sanitizePosition() {
                var current = $scope.toastPosition;

                if (current.bottom && last.top) current.top = false;
                if (current.top && last.bottom) current.bottom = false;
                if (current.right && last.left) current.left = false;
                if (current.left && last.right) current.right = false;

                last = angular.extend({}, current);
            }

            $scope.showActionToast = function () {
                var pinTo = $scope.getToastPosition();
                var toast = $mdToast.simple()
                    .textContent($scope.disklejmer)
                    .action('Zatvori')
                    .highlightAction(true)
                    .highlightClass('md-accent')
                    .position(pinTo)
                    .hideDelay(0)
                    .toastClass('toast');

                $mdToast.show(toast).then(function (response) {
                    if (response == 'ok') {

                    }
                });
            };

            odgovoriService.getDataOdg($scope.language).then(function (data1) {
                processDataOdg(data1);
            });
        };

        function processDataOdg(data) {

            $scope.odgovori = data;
            $scope.licniPodaci = {
                ime: '',
                prezime: '',
                datumRodjenja: '',
                pol: '',
                zanimanje: '',
                ulica: '',
                broj: '',
                grad: '',
                drzava: '',
                zemlja: '',
                drzavljanstvo: '',
                email1: '',
                email2: '',
                mobilniTelefon: '',
                skype: '',
                aplikacija: '',
                referenca: '',
                komentar: '',

            };
            $scope.pitanje1 = {
                grad: '',
                znanje: '',
                vrstaKursa: '',
                brojCasovaNedeljno: '',
                duzinaTrajanjaKursa: '',
                cenaKursa: 0,
                datumPocetkaKursa: '',
                smestaj: '',
                duzinaBoravka: ['', ''],
                cenaSmestaja: 0,
                transverAerodrom: 0,
                rasporedTerminiKojiOdgovarajuPolazniku: {
                    rasporedPonedeljak: [],
                    rasporedUtorak: [],
                    rasporedSreda: [],
                    rasporedCetvrtak: [],
                    rasporedPetak: [],
                    rasporedSubota: [],
                    rasporedNedelja: [],
                },
                ukupnaCena: 0,
                disklejmer: ''
            };
            $scope.requiredMob = false;
            $scope.isActive = [true, true, true, true];
            $scope.textActive = false;

            $scope.settings = {
                scrollableHeight: '400px',
                scrollableWidth: '140px',
                scrollable: true,
                enableSearch: true
            };
            $scope.raspored = [{
                "termini": "8h-9h",

    }, {
                "termini": "9h-10h",

    }, {
                "termini": "10h-11h",

    }, {
                "termini": "11h-12h",

    }, {
                "termini": "12h-13h",

    }, {
                "termini": "14h-15h",

    }, {
                "termini": "15h-16h",

    }, {
                "termini": "16h-17h",

    }, {
                "termini": "17h-18h",

    }, {
                "termini": "18h-19h",

    }, {
                "termini": "19h-20h",

    }];
            $scope.example2settings = {
                displayProp: 'termini'
            };

            $scope.activeButton = function (num) {
                switch (num) {
                    case 0:
                        if ($scope.dugmici === 'da') {
                            $scope.requiredMob = true;
                            $scope.licniPodaci.aplikacija = '';
                            $scope.isActive = [false, false, false, false];
                            $scope.textActive = true;
                        }
                        if ($scope.dugmici === 'ne') {
                            $scope.requiredMob = false;
                            $scope.licniPodaci.aplikacija = '';
                            $scope.isActive = [true, true, true, true];
                            $scope.textActive = false;
                        }
                        break;
                    case 1:
                        $scope.isActive = [false, true, true, true];
                        $scope.licniPodaci.aplikacija = 'Viber';
                        console.log("treba");
                        $scope.textActive = false;
                        break;
                    case 2:
                        $scope.isActive = [true, false, true, true];
                        $scope.licniPodaci.aplikacija = 'WhatsApp';
                        $scope.textActive = false;
                        break;
                    case 3:
                        $scope.isActive = [true, true, false, true];
                        $scope.licniPodaci.aplikacija = 'Telegram';
                        $scope.textActive = false;
                        break;
                    case 4:
                        $scope.isActive = [true, true, true, false];
                        $scope.licniPodaci.aplikacija = 'Skype';
                        $scope.textActive = false;
                        break;
                }
            }

            $scope.popust = 0;
            $scope.dvaObrokaDnevno = 0;
            $scope.doplataRucak = 100;
            $scope.dodatniCasoviJezika = 195;
            $scope.ispitSertifikat = 100;
            $scope.mesta = ['Beograd', 'Valjevo', 'On-line'];
            $scope.znanjeSrspskog = $scope.odgovori.beograd.samoocenjivanje;
            $scope.kurseviIskustvoZivot;
            $scope.cenaTransfera;

            $scope.changeValueFormular = function (num, item) {
                switch (num) {
                    case 0:
                        $scope.pitanje1.grad = item;
                        switch ($scope.pitanje1.grad) {
                            case 'Beograd':
                                $scope.kursevi = $scope.odgovori.beograd.kurs;
                                $scope.smestaji = $scope.odgovori.beograd.smestaj;
                                $scope.onOffTransfer = false;
                                break;
                            case 'Valjevo':
                                $scope.onOffTransfer = false;
                                break;
                            case 'On-line':
                                $scope.onOffTransfer = true;
                            default:
                                $scope.onOffTransfer = true;
                                $scope.kursevi = [];
                        }

                        break;
                    case 1:
                        if (item.imeKursa === "Individualni kurs") {
                            $scope.preskociRaspored = false;
                        } else {
                            $scope.preskociRaspored = true;
                        }
                        $scope.pitanje1.vrstaKursa = item.imeKursa;
                        $scope.help = $scope.brojNedelja = item.duzinaTrajanjaKursa;
                        $scope.datumOdrzavanja = item.datumPocetkaKursa;
                        $scope.brojCasovaNedeljno = item.brojCasovaNedeljno;
                        break;
                    case 2:
                        $scope.pitanje1.brojCasovaNedeljno = item.broj;
                        $scope.cenaPoNedeljiBezPopusta = item.cenaPoNedeljiBezPopusta;
                        $scope.realnaCenaPoNedelji = item.cenaPoNedelji;
                        $scope.dodatakCeni = item.dodatakCeni;
                        $scope.cenaPoFormuli = item.cenaPoFormuli;

                        $scope.duzinaTrajanjaKursaSaCenom = item.duzinaTrajanjaKursaSaCenom;
                        console.log(_.size(item) + 1);
                        console.log(item);
                        break;
                    case 3:
                        $scope.pitanje1.duzinaTrajanjaKursa = item;
                        $scope.n = item.split("")[0];
                        if ($scope.cenaPoFormuli === "da") {
                            $scope.popust = $scope.n * $scope.cenaPoNedeljiBezPopusta + $scope.dodatakCeni - $scope.realnaCenaPoNedelji * $scope.n - $scope.dodatakCeni;
                            $scope.pitanje1.cenaKursa = $scope.n * $scope.cenaPoNedeljiBezPopusta;
                            $scope.cenaSaPopustom = $scope.n * $scope.realnaCenaPoNedelji + $scope.dodatakCeni;
                        }

                        if ($scope.cenaPoFormuli === "ne") {
                            for (var i = 0; i < $scope.duzinaTrajanjaKursaSaCenom.length; i++) {
                                if ((($scope.duzinaTrajanjaKursaSaCenom[i]).split(","))[0] === $scope.pitanje1.duzinaTrajanjaKursa) {
                                    $scope.cenaSaPopustom = $scope.duzinaTrajanjaKursaSaCenom[i].split(",")[1].split(" ")[2];
                                    $scope.popust = parseInt($scope.duzinaTrajanjaKursaSaCenom[i].split(",")[1].split(" ")[2] / 10 * 2 + $scope.cenaSaPopustom) + "";
                                    $scope.pitanje1.cenaKursa = parseInt($scope.duzinaTrajanjaKursaSaCenom[i].split(",")[1].split(" ")[2]) + parseInt($scope.popust) + "";
                                }
                            }
                        }
                        break;
                    case 4:
                        break;
                    case 5:
                        break;
                    case 6:
                        $scope.pitanje1.smestaj = item.vrstaSmestaja;
                        $scope.cenaSmestaja = item.cenaNedeljno;
                        break;
                    case 7.1:
                        $scope.pitanje1.duzinaBoravka[0] = item;
                        $scope.evalMess = false;
                        console.log($scope.evalMess);
                        break;
                    case 7.2:
                        $scope.pitanje1.duzinaBoravka[1] = item;
                        $scope.evalMess = false;
                        console.log($scope.evalMess);
                        break;
                    case 8:
                        if (item === 'da') {
                            $scope.pitanje1.transverAerodrom = $scope.odgovori.beograd.dodatno[0].transferAerodromCena;
                        }
                        if (item === 'ne') {
                            $scope.pitanje1.transverAerodrom = 0;
                        }
                        break;
                    case 9:
                        $scope.pitanje1.znanje = item;
                        break;
                    case 10:
                        if (item === 'da') {
                            $scope.onOffSmestaj = false;
                            $scope.pitanje1.smestaj = "/";
                            $scope.pitanje1.cenaSmestaja = "/";
                        }
                        if (item === 'ne') {
                            $scope.onOffSmestaj = true;
                            $scope.pitanje1.smestaj = "/";
                            $scope.pitanje1.cenaSmestaja = "/";
                        }
                        break;
                    case 11:
                        break;
                    case 14:
                        $scope.pitanje1.datumPocetkaKursa = item;
                        if ($scope.pitanje1.vrstaKursa === "Standardni kurs individualno" || $scope.pitanje1.vrstaKursa === "Standardni kurs u grupi") {
                            switch ($scope.pitanje1.datumPocetkaKursa) {
                                case "1. novembar":
                                    $scope.brojNedelja = $scope.help.slice(0, $scope.brojNedelja.length - 2);
                                    break;
                                case "1. februar":
                                    $scope.brojNedelja = $scope.help.slice(0, $scope.brojNedelja.length - 4);
                                    break;
                                case "2. april":
                                    $scope.brojNedelja = $scope.help.slice(0, 1);
                                    break;
                                default:
                                    $scope.brojNedelja = $scope.help;
                            }
                        }
                        break;
                    default:
                }
            }

            $scope.$on('$locationChangeStart', function (event) { //  Back and forward button, tab selector
                $scope.tab = ((((($location.absUrl()) + "").split("="))[(($location.absUrl()) + "").split("=").length - 2]).split("&"))[0];
                if ($scope.tab.split("").length > 1) {
                    $scope.tab = (($location.absUrl()) + "").split("=")[(($location.absUrl()) + "").split("=").length - 1];
                }
                switch ($scope.tab) {
                    case "0":

                        $scope.tabs = [true, false, false, false, false, false, false, false, false, false];
                        break;
                    case "1":

                        $scope.tabs = [false, true, false, false, false, false, false, false, false, false];
                        break;
                    case "2":
                        $scope.tabs = [false, false, true, false, false, false, false, false, false, false];
                        break;
                    case "3":
                        $scope.tabs = [false, false, false, true, false, false, false, false, false, false];

                        break;
                    case "4":
                        $scope.tabs = [false, false, false, false, true, false, false, false, false, false];

                        break;
                    case "5":
                        $scope.tabs = [false, false, false, false, false, true, false, false, false, false];

                        break;
                    case "6":
                        $scope.tabs = [false, false, false, false, false, false, true, false, false, false];

                        break;
                    case "null":
                        location.reload();
                        break;
                }
            });

            $scope.tabs = [true, false, false, false, false, false, false, false, false, false];


            $scope.backTab = function (num) {
                switch (num) {
                    case 12:
                        $scope.tabs = [false, false, false, false, false, false, false, false, false, false, false, false, true, false];
                        break;
                    case 11:
                        $scope.tabs = [false, false, false, false, false, false, false, false, false, false, false, true, false, false];
                        break;
                    case 10:
                        $scope.tabs = [false, false, false, false, false, false, false, false, false, false, true, false, false, false];
                        break;
                    case 9:
                        $scope.tabs = [false, false, false, false, false, false, false, false, false, true, false, false, false, false];
                        break;
                    case 8:
                        $scope.tabs = [false, false, false, false, false, false, false, false, true, false, false, false, false, false];
                        break;
                    case 7:
                        $scope.tabs = [false, false, false, false, false, false, false, true, false, false, false, false, false, false];
                        break;
                    case 6:
                        $scope.tabs = [false, false, false, false, false, false, true, false, false, false, false, false, false, false];
                        break;
                    case 5:
                        $scope.tabs = [false, false, false, false, false, true, false, false, false, false, false, false, false, false];
                        break;
                    case 4:
                        $scope.tabs = [false, false, false, false, true, false, false, false, false, false, false, false, false, false];
                        break;
                    case 3:
                        $scope.tabs = [false, false, false, true, false, false, false, false, false, false, false, false, false, false];
                        break;
                    case 2:
                        if ($scope.preskociRaspored === true) {
                            $scope.tabs = [false, true, false, false, false, false, false, false, false, false];
                        } else {
                            $scope.tabs = [false, false, true, false, false, false, false, false, false, false, false, false, false, false];
                        }
                        break;
                    case 1:
                        $scope.tabs = [false, true, false, false, false, false, false, false, false, false, false, false, false, false];
                        break;
                    case 0:
                        $scope.tabs = [true, false, false, false, false, false, false, false, false, false, false, false, false, false];
                        break;
                    default:
                };
            }

            $scope.hoverIn = function () {
                this.hoverEdit = true;
            };

            $scope.hoverOut = function () {
                this.hoverEdit = false;
            };

            $scope.corectValue = function (item) {
                switch (item) {
                    case 0:
                        $scope.tabs = [true, false, false, false, false, false, false, false, false, false];
                        break;
                    case 1:
                        $scope.tabs = [false, true, false, false, false, false, false, false, false, false];
                        break;
                    case 2:
                        $scope.tabs = [false, false, true, false, false, false, false, false, false, false];
                        break;
                    case 3:
                        $scope.tabs = [false, false, false, true, false, false, false, false, false, false];
                        break;
                    default:
                        break;
                }
            }
        }

        $scope.searchTracks = function (languagePar) {


            $scope.language = languagePar;
            $location.search('tab', "0");
            pitanjaService.getDataPit($scope.language).then(function (data) {
                processDataPit(data);
            });
        }
        $scope.setpar = function (item) {
            switch (item) {
                case 1:
                    if ($scope.pitanje1.grad === '' || $scope.pitanje1.znanje === '') {
                        $scope.evalMess = true;
                        break;


                    }
                    $scope.evalMess = false;
                    $location.search('tab', item);
                    $location.path("/prijava/new");
                    break;
                case 2:
                    if ($scope.pitanje1.vrstaKursa === '' || $scope.pitanje1.brojCasovaNedeljno === '' || $scope.pitanje1.duzinaTrajanjaKursa === '' || $scope.pitanje1.datumPocetkaKursa === '') {
                        $scope.evalMess = true;
                        break;
                    }
                    if ($scope.preskociRaspored === true) {
                        $location.search('tab', item + 1);
                        $location.path("/prijava/new");
                        $scope.evalMess = false;


                    }
                    if ($scope.preskociRaspored === false) {
                        $location.search('tab', item);
                        $location.path("/prijava/new");
                        $scope.evalMess = false;
                    }

                    break;
                case 3:
                    $location.search('tab', item);
                    $location.path("/prijava/new");
                    break;
                case 4:
                    if ($scope.onOffSmestaj === false) {
                        if ($scope.pitanje1.duzinaBoravka[0] === '' || $scope.pitanje1.duzinaBoravka[1] === '') {
                            $scope.evalMess = true;
                            break;
                        }
                    }
                    $location.search('tab', item);
                    $location.path("/prijava/new");
                    $scope.evalMess = false;

                    break;
                case 5:
                    $location.search('tab', item);
                    $location.path("/prijava/new");

                    break;
                case 6:
                    $location.search('tab', item);
                    $location.path("/prijava/new");

                    break;
                case 0:
                    $location.search('tab', item);
                    $location.path("/prijava/new");


                    break;
                case "null":
                    location.reload();
                    break;
            }

        }

        pitanjaService.getDataPit($scope.language).then(function (data) {
            processDataPit(data);
        });
    })
    .controller('ToastCtrl', function ($scope, $mdToast) {
        $scope.closeToast = function () {
            $mdToast.hide();
        };
    });
