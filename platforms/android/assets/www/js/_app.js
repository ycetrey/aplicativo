var laravel = "http://marketing.onlinefocus.com.br/laravel/public/";

var showAlert = function($title, $template, $sucess, $scope, $ionicPopup) {
    var alertPopup = $ionicPopup.alert({
        title: $title,
        template: $template
    });

    alertPopup.then(function(res) {
        //console.log('Thank you for not eating my delicious ice cream cone');
    });
};

var openFile = function ($arq, $cordovaFileOpener2){
    $cordovaFileOpener2.open(
        $arq,
        'application/pdf'
    ).then(function() {}, function(err) {
            alert('Você não possui aplicativo para abrir PDF.');
            cordova.InAppBrowser.open('https://play.google.com/store/apps/details?id=com.adobe.reader', '_system', 'location=yes');
        });
};

var app = angular.module('focusconcursos', ['ionic','focusconcursos.services','ionic.service.push','ionic.service.core','ionicLazyLoad','ngCordova']);

app.config(['$ionicAppProvider', function($ionicAppProvider) {
    $ionicAppProvider.identify({
        app_id: 'ca56143b',
        api_key: 'f92ee88709ddb4be6eaee611ca3e5340d7b91c36ded90b9c',
        gcm_id: '287262467974',
        dev_push: false
    });
}]);

app.run(function($ionicPlatform, $rootScope, $ionicLoading, $ionicPush, $ionicUser) {

    function register() {
        alert("Regisitrando...");
        var config = {
            "badge": "true",
            "sound": "true",
            "alert": "true"
        };
        $ionicPush.register(config).then(function (token) {
            alert("Register success "+ token);
        }, function (err) {
            alert("Register error "+ err);
        });
    };

    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        if(window.cordova){
            var user = $ionicUser.get();
            if(!user.user_id) {
                user.user_id = $ionicUser.generateGUID();
            };

            angular.extend(user, {
                name: localStorage.getItem('aluno.nome'),
                emai: localStorage.getItem('aluno.email'),
                id: localStorage.getItem('aluno.id')
            });

            $ionicUser.identify(user);
            setTimeout(function(){
                register();
            },5000);
        }

    });

    $rootScope.$on('loading:show', function() {
        $ionicLoading.show({template: '<ion-spinner class="light"></ion-spinner><br>Carregando'});
    });

    $rootScope.$on('loading:hide', function() {
        $ionicLoading.hide();
    });

    /*
     $ionicPlatform.registerBackButtonAction(function(event) {
     screen.lockOrientation('portrait');
     }, 100);
     */

})

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

        $ionicConfigProvider.tabs.position('bottom');
        /*
         $httpProvider.interceptors.push(function($rootScope) {
         return {
         request: function(config) {
         $rootScope.$broadcast('loading:show');
         return config;
         },
         response: function(response) {
         $rootScope.$broadcast('loading:hide');
         return response;
         }
         };
         });
         */

        $stateProvider
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })
            .state('tab.cursos', {
                url: '/cursos',
                views: {
                    'tab-cursos': {
                        templateUrl: 'templates/tab-cursos.html',
                        controller: 'CursosCtrl'
                    }
                }
            })
            .state('tab.curso-detalhe', {
                cache: false,
                url: '/curso/:cursoId',
                views: {
                    'tab-cursos': {
                        templateUrl: 'templates/curso-detalhe.html',
                        controller: 'CursoCtrl'
                    }
                }
            })
            .state('tab.curso-aovivo-detalhe', {
                cache: false,
                url: '/curso-aovivo/:cursoId',
                views: {
                    'tab-cursos': {
                        templateUrl: 'templates/curso-aovivo-detalhe.html',
                        controller: 'CursoCtrl'
                    }
                }
            })
            .state('tab.material-detalhe', {
                cache: false,
                url: '/materia/:materiaId',
                views: {
                    'tab-cursos': {
                        templateUrl: 'templates/materia-detalhe.html',
                        controller: 'MateriaCtrl'
                    }
                }
            })
            .state('tab.evento ', {
                url: '/evento',
                views: {
                    'tab-evento': {
                        templateUrl: 'templates/tab-evento.html',
                        controller: 'EventoCtrl'
                    }
                }
            })
            .state('tab.sac ', {
                url: '/sac',
                views: {
                    'tab-sac': {
                        templateUrl: 'templates/tab-sac.html',
                        controller: 'SacCtrl'
                    }
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });

app.controller('LoginCtrl', function($scope, $http, $state, $ionicPopup, String) {

    $scope.$on('$ionicView.enter', function(e) {
        if(window.isCordovaApp) {
            screen.lockOrientation('portrait');
        }
    });

    if (localStorage.getItem('aluno.id')) {
        $state.go('tab.dash');
    }

    $scope.openBrowser = function() {
        window.open('http://online.focusconcursos.com.br/cliente/acesso', '_self');
    };

    $scope.signIn = function(login){

        $username = String.reverse(window.btoa(login.username.toLowerCase()));
        $senha = String.reverse(window.btoa(login.password.toLowerCase()));

        $http({
            method: 'GET',
            url: laravel+"api/user/"+$username+"/"+$senha
        }).then(function successCallback(response) {
            localStorage.setItem("aluno.id", response.data.id);
            localStorage.setItem("aluno.nome", response.data.nome);
            localStorage.setItem("aluno.email", response.data.email);

            $state.go('tab.dash');
        }, function errorCallback(response) {
            localStorage.removeItem('aluno');
            showAlert("Erro", "Ocorreu algum erro, tente novamente mais tarde.", null, $scope, $ionicPopup);
        });

    };

});

app.controller('DashCtrl', function($scope, $rootScope, $http) {
    var key = '';
    var s = '';
    var lista = '';
    var itens = [];

    /*
     , $ionicUser, $ionicPush

     $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
     console.log('Got token', data, data.token, data.platform);
     });

     $scope.pushRegister = function() {
     $ionicPush.register({
     canShowAlert: true,
     canSetBadge: true,
     canPlaySound: true,
     canRunActionsOnWake: true,
     onNotification: function(notification) {}
     }).then(function(deviceToken) {
     $rootScope.token = deviceToken;
     });
     };

     $scope.identifyUser = function() {
     var user = $ionicUser.get();
     if(!user.user_id) {
     user.user_id = $ionicUser.generateGUID();
     };
     angular.extend(user, {
     name: localStorage.getItem('aluno.nome'),
     emai: localStorage.getItem('aluno.email'),
     cliente_id: localStorage.getItem('aluno.id')
     });
     $ionicUser.identify(user);
     setTimeout(function(){
     $scope.pushRegister();
     },5000);
     };
     */
    $scope.loadData = function(){
        $http({
            method: 'GET',
            url: laravel+"api/home/get",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function successCallback(response) {
            for (var ln = 0; ln < Object.keys(response.data.listas).length; ln++) {

                key = Object.keys(response.data.listas)[ln];
                lista = eval(response.data.listas[key]);

                var objeto = {};
                title = '';
                title = key;
                objeto.dicas = [];

                var count = 0;
                for(var s in lista.items){
                    if(lista.items[s].snippet.thumbnails)
                        objeto.dicas.push({'titulo': lista.items[s].snippet.title,'texto': lista.items[s].snippet.description,'videoId':lista.items[s].snippet.resourceId.videoId,'thumbnail': lista.items[s].snippet.thumbnails.default.url});
                }

                objeto.title = title;
                itens.push(objeto);
            }

            $scope.itens = itens;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.abrirVideo = function(video){
        if(device.manufacturer.indexOf('motorola') == -1)
            YoutubeVideoPlayer.openVideo(video);
        else
            cordova.plugins.videoPlayer.play("https://www.youtube.com/watch?v="+video);
    };

    $scope.$on('$ionicView.enter', function(e) {
        $scope.loadData();
        if(window.isCordovaApp) {
            screen.lockOrientation('portrait');
        }
    });
});

app.controller('CursosCtrl', function($scope, $http, $state, $ionicScrollDelegate, String) {

    $scope.onTabSelected = function() {
        $state.go('tab.cursos');
    };

    $username = String.reverse(window.btoa(localStorage.getItem('aluno.email')));

    $scope.$on('$ionicView.enter', function(e) {
        //screen.lockOrientation('portrait');
        $http({
            method: 'GET',
            url: laravel+"api/cliente-curso/"+$username,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function successCallback(response) {
            $scope.cursos = response.data;
            $scope.$broadcast('scroll.refreshComplete');
            $ionicScrollDelegate.resize();
        });
        //screen.lockOrientation('portrait');
    });

});

app.controller('CursoCtrl', function($rootScope, $scope, $http, $stateParams, $ionicScrollDelegate, String) {

    $curso = String.reverse(window.btoa($stateParams.cursoId));
    $username = String.reverse(window.btoa(localStorage.getItem('aluno.email')));
    $id  = $stateParams.cursoId;

    $scope.$on('$ionicView.enter', function(e) {

        //alert(cordova.file.dataDirectory);

        $http({
            method: 'GET',
            url: laravel+"api/disciplinas-curso/"+$username+"/"+$curso,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function successCallback(response) {
            //console.log(response.data);
            //$scope.cursos = response.data.data;
            for (var ln = 0; ln < Object.keys(response.data).length; ln++) {

                key = Object.keys(response.data)[ln];
                lista = eval(response.data[key]);

                var objeto = {};
                live_stream = lista.live_stream;
                title = lista.curso_nome;
                imagem = lista.video_imagem;
                curso = lista.curso;
                item = [];
                objeto.disciplina = [];

                $rootScope.videoaulas = [];

                for(var s in lista.disciplina){
                    objeto.disciplina.push(
                        {
                            'disciplina': lista.disciplina[s].data.disciplina,
                            'professor': lista.disciplina[s].data.professor,
                            'thumbnail': lista.disciplina[s].data.professor_anexo,
                            'id': s
                        });

                    item[s] =
                    {
                        'disciplina': lista.disciplina[s].data.disciplina,
                        'professor': lista.disciplina[s].data.professor,
                        'thumbnail': lista.disciplina[s].data.professor_anexo,
                        'id': s,
                        'videoaula': lista.disciplina[s].videoaula
                    };
                }

                objeto.title = title;
                objeto.live_stream = live_stream;
                objeto.imagem = imagem;
                $scope.cursos = objeto;
                $rootScope.videoaulas = item;
                $ionicScrollDelegate.resize();
            }
        });
        //screen.lockOrientation('portrait');

        $scope.viewAoVivo = function(){
            var options = {
                successCallback: function() {
                    return true;
                },
                errorCallback: function(errMsg) {
                    showAlert("Aviso", "A Aula estará acessivel no dia "+data, null, $scope, $ionicPopup);
                    return true;
                },
                orientation: 'landscape'
            };
            window.plugins.streamingMedia.playVideo("rtsp://54.233.98.140:8084/"+live_stream, options);
            $ionicScrollDelegate.resize();
        };


    });

});

app.controller('MateriaCtrl', function($rootScope, $scope, $http, $stateParams, $ionicPopup, $ionicScrollDelegate, $timeout, String, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2) {

    $materia = String.reverse(window.btoa($stateParams.materiaId));
    $scope.$on('$ionicView.enter', function(e) {
        screen.lockOrientation('portrait');
    });

    $scope.videoaulas = $rootScope.videoaulas[$stateParams.materiaId];
    //console.table($scope.videoaulas);

    $scope.viewVideoAula = function(videoaula, biblioteca, duracao){

        /*
         if(duracao == "00:00:00"){
         showAlert("Aviso", "Esta aula ainda não está disponível!", null, $scope, $ionicPopup);
         return false;
         }
         */
        $http({
            method: 'GET',
            url: laravel+"api/videoaula/"+localStorage.getItem('aluno.id')+"/"+biblioteca+"/"+videoaula,
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function successCallback(response) {
            if(response.data.status == 0){
                showAlert("Aviso", "Esta aula ainda não está disponível!", null, $scope, $ionicPopup);
            } else {
                var options = {
                    successCallback: function () {
                        return true;
                    },
                    errorCallback: function (errMsg) {
                        showAlert("Aviso", "Esta aula ainda não está disponível!", null, $scope, $ionicPopup);
                        return true;
                    },
                    orientation: 'landscape'
                };
                window.plugins.streamingMedia.playVideo(window.atob(response.data.url_http), options);
            }
            $ionicScrollDelegate.resize();
        });
    };

    $scope.viewVideoPdf = function(videoaula, duracao){

        if(duracao == "00:00:00"){
            showAlert("Aviso", "Esta aula ainda não está disponível!", null, $scope, $ionicPopup);
            return false;
        }

        var url = "http://www.focusconcursos.com.br/focus-online/videoaula/downloadBiblioteca/source/anexo/id/"+videoaula+"/phone/1";
        var filename = videoaula+".pdf";
        var path = cordova.file.externalRootDirectory+"com.focusconcursos/files/pdf/";
        var targetPath = path+filename;

        $cordovaFile.checkFile(path, filename).then(function(result) {
            openFile(targetPath, $cordovaFileOpener2);
        }, function(err) {
            $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
                    openFile(targetPath, $cordovaFileOpener2);
                }, function (error) {
                    alert('Erro! Verifique sua conexão de internet ou tente novamente mais tarde');
                }, function (progress) {}
            );
        });

    };
});

app.controller('EventoCtrl', function($scope, $http, $ionicPopup, $ionicScrollDelegate) {

    $scope.$on('$ionicView.enter', function(e){
        $http({
            method: 'GET',
            url: laravel+"api/eventos",
            dataType: 'json',
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function successCallback(response) {
            $scope.eventos = response.data.eventos;
        });
    });

    $scope.viewEvento = function(param, data){
        var options = {
            successCallback: function() {
                return true;
            },
            errorCallback: function(errMsg) {
                showAlert("Aviso", "O Evento estará acessivel no dia "+data, null, $scope, $ionicPopup);
                return true;
            },
            orientation: 'landscape'
        };
        if(param.indexOf("http") === 0)
            window.plugins.streamingMedia.playVideo(param, options);
        else
            window.plugins.streamingMedia.playVideo("rtsp://54.233.98.140:8084/"+param, options);
        $ionicScrollDelegate.resize();
    };

    $scope.viewEventoAudio = function(param, data){
        var options = {
            bgColor: "#FFFFFF",
            bgImage: "img/logo-azul.png",
            bgImageScale: "fit", // other valid values: "stretch"
            initFullscreen: false, // true(default)/false iOS only
            orientation: 'landscape'
        };
        window.plugins.streamingMedia.playAudio("rtsp://54.233.98.140:8084/"+param+"_aac", options);
        $ionicScrollDelegate.resize();
    };

});

app.controller('SacCtrl', function($scope, $state, $http, $ionicPopup, $ionicScrollDelegate) {

    $scope.$on('$ionicView.enter', function(e){
        //screen.lockOrientation('portrait');
    });

    $scope.openSite = function() {
        window.open('http://online.focusconcursos.com.br/', '_system');
    };

    $scope.logOut = function(){
        localStorage.removeItem("aluno.id");
        localStorage.removeItem("aluno.nome");
        localStorage.removeItem("aluno.email");

        $state.go('login');
    };

});

//http://marketing.onlinefocus.com.br/laravel/public/api/videoaula/2491/0/4534
//http://marketing.onlinefocus.com.br/laravel/public/api/videoaula/2491/1/11079