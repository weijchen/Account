// public/core.js
var bogoAccount = angular.module('bogoAccount', []);

function mainController($scope, $http, $window) {
    $scope.formData = {};

    // when landing on the page, get all todos and show them
    $http.get('/api/accounts').success(function(data) {
            $scope.accounts = data;
        //     for(var i = 0 ; i < formData.priority.length ; i ++){
        //     console.log(data.priority[i]);
        // };
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createAccount = function() {
        $http.post('/signup', $scope.formData).success(function(data) {
        // $http.post('/api/accounts', $scope.formData).success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.accounts = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
    $scope.loginAccount = function(){
        $http.post('/api/login', $scope.loginData).success(function(data){
            $scope.accounts = data;
            console.log(data);
            //alert(data.username + " Welcome back!");
            // $location.path("http://localhost:8888/branch.html");
            // $location.url("http://localhost:8888/branch.html");
            // $window.location.href = 'http://localhost:3000/profile';
        })
        .error(function(data){
            console.log('Error: ' + data);
        });
    };

    // delete a todo after checking it
    // $scope.deleteAccouns = function(id) {
    //     $http.delete('/api/accounts/' + id).success(function(data) {
    //             $scope.accounts = data;
    //             console.log(data);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         });
    // };

    // $scope.lulala = function(){
    //     // alert('hello');
        
    }