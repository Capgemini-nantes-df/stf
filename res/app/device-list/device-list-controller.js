var QueryParser = require('./util/query-parser')

module.exports = function DeviceListCtrl(
  $scope
, DeviceService
, DeviceColumnService
, GroupService
, ControlService
, SettingsService
, $location
, $rootScope
) {

  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.columnDefinitions = DeviceColumnService
  $scope.screenshotsAll = []
  $scope.blurUrl = false
  var faviconIsSet = false

  var defaultColumns = [
    {
      name: 'state'
    , selected: true
    }
  , {
      name: 'model'
    , selected: true
    }
  , {
      name: 'name'
    , selected: true
    }
  , {
      name: 'serial'
    , selected: false
    }
  , {
      name: 'operator'
    , selected: true
    }
  , {
      name: 'releasedAt'
    , selected: true
    }
  , {
      name: 'version'
    , selected: true
    }
  , {
      name: 'network'
    , selected: false
    }
  , {
      name: 'display'
    , selected: false
    }
  , {
      name: 'manufacturer'
    , selected: false
    }
  , {
      name: 'sdk'
    , selected: false
    }
  , {
      name: 'abi'
    , selected: false
    }
  , {
      name: 'cpuPlatform'
    , selected: false
    }
  , {
      name: 'browser'
    , selected: false
    }
  , {
      name: 'phone'
    , selected: false
    }
  , {
      name: 'imei'
    , selected: false
    }
  , {
      name: 'imsi'
    , selected: false
    }
  , {
      name: 'iccid'
    , selected: false
    }
  , {
      name: 'batteryHealth'
    , selected: false
    }
  , {
      name: 'batterySource'
    , selected: false
    }
  , {
      name: 'batteryStatus'
    , selected: false
    }
  , {
      name: 'batteryLevel'
    , selected: false
    }
  , {
      name: 'batteryTemp'
    , selected: false
    }
  , {
      name: 'provider'
    , selected: true
    }
  , {
      name: 'notes'
    , selected: true
    }
  , {
      name: 'owner'
    , selected: true
    }
  ]

  $scope.columns = defaultColumns

  SettingsService.bind($scope, {
    target: 'columns'
  , source: 'deviceListColumns'
  })

  var defaultSort = {
    fixed: [
      {
        name: 'state'
        , order: 'asc'
      }
    ]
    , user: [
      {
        name: 'name'
        , order: 'asc'
      }
    ]
  }

  $scope.sort = defaultSort

  SettingsService.bind($scope, {
    target: 'sort'
  , source: 'deviceListSort'
  })

  $scope.filter = []

  $scope.activeTabs = {
    icons: true
  , details: false
  }

  SettingsService.bind($scope, {
    target: 'activeTabs'
  , source: 'deviceListActiveTabs'
  })

  $scope.toggle = function(device) {
    if (device.using) {
      $scope.kick(device)
    } else {
      $location.path('/control/' + device.serial)
    }
  }

  $scope.invite = function(device) {
    return GroupService.invite(device).then(function() {
      $scope.$digest()
    })
  }

  $scope.kick = function(device) {
    return GroupService.kick(device).then(function() {
      $scope.$digest()
    })
  }

  $scope.applyFilter = function(query) {
    $scope.filter = QueryParser.parse(query)
  }

  $scope.search = {
    deviceFilter: '',
    focusElement: false
  }

  $scope.focusSearch = function() {
    if (!$scope.basicMode) {
      $scope.search.focusElement = true
    }
  }

  $scope.reset = function() {
    $scope.search.deviceFilter = ''
    $scope.filter = []
    $scope.sort = defaultSort
    $scope.columns = defaultColumns
  }

/********************************************************************/
/****Ajout de fonctionnalités - tous les appareils qu'on utilise****/
/******************************************************************/

 /**
 * Sélection de tous les appareils utilisés en meme temps.
 */
  $scope.selectAll = function()
  {
    for(var i=0; i < $scope.tracker.devices.length; i++)
    {
      $scope.invite($scope.tracker.devices[i])
    }    
  }

  /**
  * Déselection de tous les appareils utilisés en meme temps.
  */
  $scope.deselectAll = function()
  {
    for(var i=0; i < $scope.tracker.devices.length; i++)
    {
      $scope.kick($scope.tracker.devices[i])
    }    
  }


 /** 
 * Réalisation de screenshots sur tous les appareils utilisés en meme temps
 */
  $scope.takeScreenshotAll = function()
  {
    $scope.screenshotsAll = []

    for(var i=0; i < $scope.tracker.devices.length; i++)
    {
      if($scope.tracker.devices[i].state == 'using')
      {
            $scope.control = ControlService.create($scope.tracker.devices[i], $scope.tracker.devices[i].channel)

            $scope.control.screenshot().then(function(result) 
            {
                $scope.$apply(function() 
                {
                  $scope.screenshotsAll.unshift(result)
                })
            })
      }   
    }  
  }
  /**
  * Nettoyage des screenshots
  */
  $scope.clearAll = function() 
  {
    $scope.screenshotsAll = []
  }



 /**
  * Ouverture du navigateur à l'url voulu sur tous les appareils utilisés en meme temps
  */
  $scope.openBrowserAll=function(url)
  {
    for(var i=0; i < $scope.tracker.devices.length; i++)
    {
      if($scope.tracker.devices[i].state=='using')
      {

        $scope.control = ControlService.create($scope.tracker.devices[i], $scope.tracker.devices[i].channel)
        $scope.control.openBrowser(url,$scope.tracker.devices[i].browser.apps[0])
      }      
    }    
  }
  $scope.openURLAll = function() 
  {
    $scope.blurUrl = true
    $rootScope.screenFocus = true

    //Appel de la fonction de formation de l'url
    var url = addHttpAll($scope.textURL)
    
    //Appel de la fonction de modification du favicon du site
    setUrlFaviconAll(url)

    return $scope.openBrowserAll(url)
  }

  /**
  * Formation de l'url
  */
  function addHttpAll(textUrl) 
  {
    // Check for '://' because a protocol-less URL might include
    // a username:password combination.
    // Ignores also any query parameter because it may contain a http:// inside.
    return (textUrl.replace(/\?.*/, '').indexOf('://') === -1 ? 'http://' : ''
      ) + textUrl
  }

  /**
  * Modfication du favicon en fonction du site auquel on se connecte
  */
  function setUrlFaviconAll(url) 
  {
    var FAVICON_BASE_URL = '//www.google.com/s2/favicons?domain_url='

    $scope.urlFavicon = FAVICON_BASE_URL + url

    faviconIsSet = true
  }


}
