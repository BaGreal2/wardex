// ==========================
// Parameters
// ==========================
param location string = resourceGroup().location

@description('Azure IoT Hub name')
param iotHubName string = 'WardexSecurityHub'

@description('Consumer group on the IoT Hub events endpoint used by the backend bridge')
param consumerGroupName string = 'wardex-backend'

@description('Storage account name for the Function App (must be globally unique if deployed)')
param storageAccountName string = 'wardexfuncsa'

@description('Function App name')
param functionAppName string = 'wardex-func-app'

@description('VM name for backend + Postgres Docker')
param vmName string = 'wardex-vm'

@description('Admin username for the VM')
param adminUsername string = 'artem'

@secure()
@description('Admin password for the VM')
param adminPassword string

@description('Port where Fastify backend listens')
param backendPort int = 3000

@secure()
@description('Event Hub-compatible connection string from the IoT Hub (IotHubEventHubConnection)')
param iotHubEventHubConnection string

@description('Event Hub-compatible name/path for the IoT Hub events endpoint')
param eventHubName string = 'iothub-ehub-wardexsecu-55804179-3a4f9ff6ff'

@description('Base URL for backend as seen from the Function App')
param backendBaseUrl string = 'http://172.161.105.207:3000'

// ==========================
// Networking for the VM
// ==========================

resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: '${vmName}-vnet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'default'
        properties: {
          addressPrefix: '10.0.0.0/24'
        }
      }
    ]
  }
}

resource nsg 'Microsoft.Network/networkSecurityGroups@2023-04-01' = {
  name: '${vmName}-nsg'
  location: location
  properties: {
    securityRules: [
      // SSH
      {
        name: 'Allow-SSH-22'
        properties: {
          priority: 1000
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '22'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
      // Backend HTTP
      {
        name: 'Allow-Backend-3000'
        properties: {
          priority: 1010
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: string(backendPort)
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
      // Postgres (for convenience; in real life, restrict to your IP)
      {
        name: 'Allow-Postgres-5432'
        properties: {
          priority: 1020
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '5432'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}

resource publicIp 'Microsoft.Network/publicIPAddresses@2023-04-01' = {
  name: '${vmName}-pip'
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    publicIPAllocationMethod: 'Dynamic'
  }
}

resource nic 'Microsoft.Network/networkInterfaces@2023-04-01' = {
  name: '${vmName}-nic'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: {
            id: resourceId('Microsoft.Network/virtualNetworks/subnets', vnet.name, 'default')
          }
          publicIPAddress: {
            id: publicIp.id
          }
        }
      }
    ]
    networkSecurityGroup: {
      id: nsg.id
    }
  }
}

// ==========================
// Linux VM (backend + Postgres Docker)
// ==========================

resource vm 'Microsoft.Compute/virtualMachines@2023-03-01' = {
  name: vmName
  location: location
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_B1s'
    }
    osProfile: {
      computerName: vmName
      adminUsername: adminUsername
      adminPassword: adminPassword
      linuxConfiguration: {
        disablePasswordAuthentication: false
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: '0001-com-ubuntu-server-focal'
        sku: '20_04-lts-gen2'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        managedDisk: {
          storageAccountType: 'Standard_LRS'
        }
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: nic.id
        }
      ]
    }
  }
}

// ==========================
// Storage account for Function App
// ==========================

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
  }
}

var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${listKeys(storage.id, \'2023-01-01\').keys[0].value};EndpointSuffix=core.windows.net'

// ==========================
// Function App plan + Function App
// ==========================

resource functionPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${functionAppName}-plan'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
}

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: functionPlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'AzureWebJobsStorage'
          value: storageConnectionString
        }
        {
          name: 'IotHubEventHubConnection'
          value: iotHubEventHubConnection
        }
        {
          name: 'EVENT_HUB_NAME'
          value: eventHubName
        }
        {
          name: 'BACKEND_BASE_URL'
          value: backendBaseUrl
        }
      ]
    }
  }
}

// ==========================
// IoT Hub + consumer group
// ==========================

resource iotHub 'Microsoft.Devices/IotHubs@2023-06-30' = {
  name: iotHubName
  location: location
  sku: {
    name: 'F1'
    capacity: 1
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    eventHubEndpoints: {
      events: {
        retentionTimeInDays: 1
        partitionCount: 2
      }
    }
  }
}

// Consumer group on the default "events" endpoint
resource iotHubConsumerGroup 'Microsoft.Devices/IotHubs/eventHubEndpoints/ConsumerGroups@2023-06-30' = {
  name: '${iotHub.name}/events/${consumerGroupName}'
  properties: {}
}

// ==========================
// Outputs for documentation
// ==========================

output vmPublicIp string = publicIp.properties.ipAddress
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output iotHubNameOut string = iotHub.name
output functionAppNameOut string = functionApp.name
