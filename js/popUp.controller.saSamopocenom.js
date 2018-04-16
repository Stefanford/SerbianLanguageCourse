angular.module('app').factory('pitanjaService', function ($http) {
        return {
            getDataPit: function (language) {
                //alert(language);
                var url = "https://api.myjson.com/bins/a6mqr";
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

                var url = "https://api.myjson.com/bins/vqacr";
                if (language === 'eng') {
                    url = "https://api.myjson.com/bins/vdzj3"
                }
                return $http.get(url).then(function (result) {
                    return result.data;
                });
            }
        }
    })


    .controller('popUp', function ($scope, $mdDialog, $rootScope, $http, $location, $routeParams, pitanjaService, odgovoriService) {

        $scope.language = "";

        function processDataPit(data) {
            //Process questions and answers data
            console.log($scope.language);
            $scope.pitanja = data;
            console.log($scope.pitanja.kartice.mesto);


            $rootScope.show = function (ev, adr) {

                function getUrlParameter(param, dummyPath) {
                    var sPageURL = dummyPath || window.location.search.substring(1),
                        sURLVariables = sPageURL.split(/[?]/),
                        res;

                    for (var i = 0; i < sURLVariables.length; i += 1) {
                        var paramName = sURLVariables[i],
                            sParameterName = (paramName || '').split('=');

                        if (sParameterName[0] === param) {
                            res = sParameterName[1];
                        }
                    }

                    return res;
                }

                $scope.language = getUrlParameter('language');

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

            function DialogFormular($scope, $mdDialog, $location) {

                odgovoriService.getDataOdg($scope.language).then(function (data) {
                    processDataOdg(data);
                });
            };
        }


        function processDataOdg(data) {
            $scope.odgovori = data;
            console.log($scope.odgovori);

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
                referenca: '',
                komentar: ''

            };




            $scope.pitanje1 = {
                grad: '',
                vrstaKursa: '',
                brojCasovaNedeljno: '',
                duzinaTrajanjaKursa: '',
                cenaKursa: 0,
                datumPocetkaKursa: '',
                smestaj: '',
                duzinaBoravka: '',
                cenaSmestaja: 0,
                transverAerodrom: 0,
                rasporedDani: '',
                rasporedSatnica: '',
                ukupnaCena: 0
            };


            $scope.brojBodova = $scope.pitanja.brojBodova;
            $scope.dugmeNazad = $scope.pitanja.dugmici.nazad;
            $scope.dugmeNapred = $scope.pitanja.dugmici.dalje;
            $scope.brojNedelja = [];
            $scope.datumOdrzavanja = [];
            $scope.brojCasovaNedeljno = [];
            $scope.onOffCasovaNedeljno = false;


            $scope.dvaObrokaDnevno = 0;
            $scope.doplataRucak = 100;
            $scope.dodatniCasoviJezika = 195;
            $scope.ispitSertifikat = 100;


            $scope.mesta = ['Beograd', 'Valjevo', 'On-line'];



            $scope.kakoCujeteSrpski = $scope.odgovori.beograd.samoocenjivanje.kakoCujeteSrpski;

            $scope.kakoCitateSrpski = $scope.odgovori.beograd.samoocenjivanje.kakoCitateSrpski;

            $scope.kakoKomunicirateSrpski = $scope.odgovori.beograd.samoocenjivanje.kakoKomunicirateSrpski;

            $scope.kakoIzrazavateSrpski = $scope.odgovori.beograd.samoocenjivanje.kakoIzrazavateSrpski;

            $scope.kakoPiseteSrpski = $scope.odgovori.beograd.samoocenjivanje.kakoPiseteSrpski;

            $scope.poznavanjeJezika = {

                slusanje: {
                    bodova: 0,
                    odgovor: ''
                },
                citanje: {
                    bodova: 0,
                    odgovor: ''
                },
                komuniciranje: {
                    bodova: 0,
                    odgovor: ''
                },
                izrazavanje: {
                    bodova: 0,
                    odgovor: ''
                },
                pisanje: {
                    bodova: 0,
                    odgovor: ''
                },
                zbirBodova: 0
            };

            $scope.kurseviIskustvoZivot;
            $scope.cenaTransfera;



            $scope.changeValueFormular = function (num, item) {
                switch (num) {
                    case 0:

                        $scope.pitanje1.grad = item;
                        console.log($scope.pitanje1.grad);
                        switch ($scope.pitanje1.grad) {
                            case 'Beograd':
                                $scope.kursevi = $scope.odgovori.beograd.kurs;
                                $scope.smestaji = $scope.odgovori.beograd.smestaj;
                                console.log($scope.odgovori.beograd.smestaj);
                                $scope.onOffSmestaj = false;
                                $scope.onOffTransfer = false;
                                break;
                            case 'Valjevo':
                                $scope.onOffSmestaj = false;
                                $scope.onOffTransfer = false;
                                break;
                            case 'On-line':
                                $scope.onOffSmestaj = true;
                                $scope.onOffTransfer = true;

                            default:
                                $scope.onOffTransfer = true;
                                $scope.onOffSmestaj = true;
                                $scope.kursevi = [];
                        }

                        break;
                    case 1:

                        $scope.pitanje1.vrstaKursa = item.imeKursa;
                        $scope.rasporedDani = item.raspored.datum;
                        $scope.rasporedSatnica = item.raspored.vreme;
                        $scope.brojNedelja = item.duzinaTrajanjaKursa;
                        $scope.datumOdrzavanja = item.datumPocetkaKursa;
                        $scope.brojCasovaNedeljno = item.brojCasovaNedeljno;
                        break;
                    case 2:
                        $scope.pitanje1.brojCasovaNedeljno = item.broj;
                        $scope.pitanje1.cenaKursa = item.cena;
                        break;
                    case 3:
                        $scope.pitanje1.duzinaTrajanjaKursa = item;
                        var help = $scope.pitanje1.cenaKursa;
                        console.log(item.split("")[0]);
                        $scope.pitanje1.cenaKursa = help * item.split("")[0];

                        break;
                    case 4:
                        $scope.pitanje1.rasporedDani = item;
                        break;
                    case 5:
                        $scope.pitanje1.rasporedSatnica = item;
                        break;
                    case 6:
                        $scope.pitanje1.smestaj = item.vrstaSmestaja;
                        $scope.cenaSmestaja = item.cenaNedeljno;
                        break;
                    case 7:
                        $scope.pitanje1.duzinaBoravka = item;
                        $scope.pitanje1.cenaSmestaja = $scope.cenaSmestaja * $scope.pitanje1.duzinaBoravka;
                        console.log($scope.pitanje1.cenaSmestaja);
                        break;
                    case 8:

                        if (item === 'da') {
                            $scope.pitanje1.transverAerodrom = $scope.odgovori.beograd.dodatno[0].transferAerodromCena;
                        }
                        if (item === 'ne') {
                            $scope.pitanje1.transverAerodrom = 0;
                        }
                        console.log($scope.pitanje1.transverAerodrom);

                        break;
                    case 9:

                        $scope.poznavanjeJezika.slusanje.odgovor = item.odgovor;
                        $scope.poznavanjeJezika.slusanje.bodova = item.bodova;
                        $scope.poznavanjeJezika.zbirBodova = $scope.poznavanjeJezika.slusanje.bodova +
                            $scope.poznavanjeJezika.citanje.bodova +
                            $scope.poznavanjeJezika.komuniciranje.bodova +
                            $scope.poznavanjeJezika.pisanje.bodova +
                            $scope.poznavanjeJezika.izrazavanje.bodova;


                        break;
                    case 10:

                        $scope.poznavanjeJezika.citanje.odgovor = item.odgovor;
                        $scope.poznavanjeJezika.citanje.bodova = item.bodova;
                        $scope.poznavanjeJezika.zbirBodova = $scope.poznavanjeJezika.slusanje.bodova +
                            $scope.poznavanjeJezika.citanje.bodova +
                            $scope.poznavanjeJezika.komuniciranje.bodova +
                            $scope.poznavanjeJezika.pisanje.bodova +
                            $scope.poznavanjeJezika.izrazavanje.bodova;


                        break;
                    case 11:

                        $scope.poznavanjeJezika.komuniciranje.odgovor = item.odgovor;
                        $scope.poznavanjeJezika.komuniciranje.bodova = item.bodova;
                        $scope.poznavanjeJezika.zbirBodova = $scope.poznavanjeJezika.slusanje.bodova +
                            $scope.poznavanjeJezika.citanje.bodova +
                            $scope.poznavanjeJezika.komuniciranje.bodova +
                            $scope.poznavanjeJezika.pisanje.bodova +
                            $scope.poznavanjeJezika.izrazavanje.bodova;


                        break;
                    case 12:

                        $scope.poznavanjeJezika.izrazavanje.odgovor = item.odgovor;
                        $scope.poznavanjeJezika.izrazavanje.bodova = item.bodova;
                        $scope.poznavanjeJezika.zbirBodova = $scope.poznavanjeJezika.slusanje.bodova +
                            $scope.poznavanjeJezika.citanje.bodova +
                            $scope.poznavanjeJezika.komuniciranje.bodova +
                            $scope.poznavanjeJezika.pisanje.bodova +
                            $scope.poznavanjeJezika.izrazavanje.bodova;


                        break;
                    case 13:

                        $scope.poznavanjeJezika.pisanje.odgovor = item.odgovor;
                        $scope.poznavanjeJezika.pisanje.bodova = item.bodova;
                        $scope.poznavanjeJezika.zbirBodova = $scope.poznavanjeJezika.slusanje.bodova +
                            $scope.poznavanjeJezika.citanje.bodova +
                            $scope.poznavanjeJezika.komuniciranje.bodova +
                            $scope.poznavanjeJezika.pisanje.bodova +
                            $scope.poznavanjeJezika.izrazavanje.bodova;


                        break;
                    case 14:

                        $scope.pitanje1.datumPocetkaKursa = item;
                        console.log(item);
                        console.log($scope.pitanje1.datumPocetkaKursa);

                        break;
                    default:


                }
            }

            $scope.tabs = [true, false, false, false, false, false, false, false, false, false];
            $scope.nextTab = function (num) {

                switch (num) {
                    case 1:
                        if ($scope.pitanje1.grad === '') {
                            break;
                        }
                        $scope.tabs = [false, true, false, false, false, false, false, false, false, false];
                        break;
                    case 2:
                        if ($scope.pitanje1.vrstaKursa === '' || $scope.pitanje1.brojCasovaNedeljno === '' || $scope.pitanje1.duzinaTrajanjaKursa === '') {
                            break;
                            console.log('usao');
                            console.log($scope.pitanje1);
                        }
                        console.log('usao');
                        console.log($scope.pitanje1);
                        $scope.tabs = [false, false, true, false, false, false, false, false, false, false];
                        break;
                    case 3:
                        if ($scope.pitanje1.rasporedDani === '' || $scope.pitanje1.rasporedSatnica === '') {
                            break;
                        }
                        $scope.tabs = [false, false, false, true, false, false, false, false, false, false];
                        break;
                    case 4:
                        if ($scope.pitanje1.smestaj === '' || $scope.pitanje1.duzinaBoravka === '' || $scope.pitanje1.transverAerodrom === '') {
                            console.log($scope.pitanje1.smestaj);
                            console.log($scope.pitanje1.duzinaBoravka);
                            console.log($scope.pitanje1.transverAerodrom);
                            break;
                        }
                        $scope.tabs = [false, false, false, false, true, false, false, false, false, false];
                        break;
                    case 5:
                        if ($scope.poznavanjeJezika.slusanje.odgovor === '') {
                            break;
                        }
                        $scope.tabs = [false, false, false, false, false, true, false, false, false, false];
                        break;
                    case 6:
                        if ($scope.poznavanjeJezika.citanje.odgovor === '') {
                            break;
                        }
                        $scope.tabs = [false, false, false, false, false, false, true, false, false, false];

                        break;
                    case 7:
                        if ($scope.poznavanjeJezika.komuniciranje.odgovor === '') {
                            break;
                        }
                        $scope.tabs = [false, false, false, false, false, false, false, true, false, false];

                        break;
                    case 8:
                        if ($scope.poznavanjeJezika.izrazavanje.odgovor === '') {
                            break;
                        }
                        $scope.tabs = [false, false, false, false, false, false, false, false, true, false];

                        break;
                    case 9:
                        if ($scope.poznavanjeJezika.izrazavanje.odgovor === '') {
                            break;
                        }
                        $scope.tabs = [false, false, false, false, false, false, false, false, false, true];

                        break;
                    default:

                };
                console.log($scope.tabs);
            }


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

                        $scope.tabs = [false, false, true, false, false, false, false, false, false, false, false, false, false, false];

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
            $location.search('language', languagePar);
            console.log($scope.language);

            pitanjaService.getDataPit($scope.language).then(function (data) {
                processDataPit(data);
            });


        }

        pitanjaService.getDataPit($scope.language).then(function (data) {
            processDataPit(data);
        });

    });
