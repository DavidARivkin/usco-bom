

class BomEntry{
  constructor(name, description, version, amount, unit, parameters){
    /*this.name        = name;
    this.description = "";
    this.version     = "0.0.1";
    this.amount      = 0;
    this.unit        = "EA";
    this.implementations = {};//"default":meshUri
    this.parameters      = "";*/
    //Object.assign(this, { x, y });
  }
}

class Bom {
  constructor(){
    
    //TODO: ermmm bom within bom?
    this.bom = [];
  }
  
  
  //basic api
  registerPart( partData, implementations, instances ){
    const entryDefaults = {
      name:"",
      description:"",
      version:"0.0.0",
      quantity:0,
      physicalQuantity:0,//this can be used for weight, distance etc
      unit:"EA",
      parameters:"",
      implementations:{}
    };
  
  }
  
   /* register a part mesh instance in the bom */
  registerPartMeshInstance( mesh ){
    var userData = mesh.userData;
    var partId   = mesh.userData.part.id;//FIXME : partID VS partInstanceID
    var instId   = "";
    
    if( !this.partMeshInstances[partId] )
    {
      this.partMeshInstances[partId] = [];
    }
    this.partMeshInstances[partId].push( mesh );
    
    if(this.partWaiters[ partId ])
    {
      console.log("resolving mesh for ", partId);
      this.partWaiters[ partId ].resolve( mesh );
    }
    
    //each instance needs a unique uid
    //FIXME: this should not be at the MESH level, so this is the wrong place for that    
    mesh.userData.part.instId = this.generateUUID();
    
    //FIXME: experimental hack , for a more data driven based approach
    
    var assemblyEntry = {
      partId:partId,
      instId:mesh.userData.part.instId, 
      pos: mesh.position.toArray(), 
      rot:mesh.rotation.toArray(), 
      scale:mesh.scale.toArray()
    };
    this.assembly.children.push( assemblyEntry );
  }
  
  /*add an instance */
  registerInstance( partId, instance )
  {
    var bomEntry = this.bom[ partId ];
    if(!bomEntry) throw new Error("bad partId specified");
    
    //console.log("registering", instance, "as instance of ", bomEntry.name ); 
    bomEntry._instances.push( instance);
    //FIXME can't we use the length of instances ? or should we allow for human settable variation
    bomEntry.qty += 1;
  }
  
  /*remove an instance */
  unRegisterInstance( partId, instance ){
    var bomEntry = this.bom[ partId ];
    if(!bomEntry) throw new Error("bad partId specified");
    
    var index = bomEntry._instances.indexOf( instance );
    if( index == -1 ) return;
    
    bomEntry._instances.splice( index, 1 );
    //FIXME can't we use the length of instances ? or should we allow for human settable variation
    bomEntry.qty -= 1;
  }
  
  /*
    Register an IMPLEMENTATIOn in the bom: an implementation is for example a mesh/ mesh file
    (stl , amf) etc: why an implementation ? because an entity/part can be created in different
    software, different formats etc, it still remains the same entity*/
  registerImplementationInFakeBOM( meshUri, partName ){
    console.log("registering", meshUri, "as implementation of ", partName); 
    if(!partName) throw new Error("no part name specified");
    
    var partIndex = -1;
    var bomEntry = null;
    
    for(var i=0;i<this.bom.length;i++)
    {
      var entry = this.bom[i];
      partIndex = i;
      if(entry.name === partName)
      {
        bomEntry = entry;
        break;
      }
    }
    
    
    if(!bomEntry){
      partIndex += 1; 
      bomEntry = {
        id:partIndex , 
        name:partName,
        description:"",
        version:"0.0.1",
        qty: 0,
        unit:"EA",
        url:"",
        implementations:{"default":meshUri},
        parameters:"",
        _instances:[],
        _instances2:{}
       };
      this.bom.push( bomEntry );
    }
    console.log("BOM",this.bom);
    return partIndex;
  }
  
  
  //helpers and extras
  isPartImplementationInBom( implementationName ){
    for(var i=0;i<this.bom.length;i++)
    {
      var entry = this.bom[i];
      var implemNames = Object.keys(entry.implementations).map(key => entry.implementations[key]); 
      
      if(implemNames.indexOf( implementationName ) !== -1)
      {
        return true;
      }
    }
    return false;
  }
  
  /*retrieve all part names*/
  getPartNames(){
    var partNames = this.bom.map(obj => obj.name); //return obj.name
    return partNames;
  }
  
  /*inject an empty entry */
  addEmtpyEntry( partName, description ){
      partIndex = this.bom.length-1;
      
      bomEntry = {
      id:partIndex , 
      name:partName,
      description:"",
      version:"0.0.1",
      qty: 0,
      unit:"EA",
      url:"",
      implementations:{"default":""},
      parameters:"",
      _instances2:{}
     };
     
    this.bom.push( bomEntry );
  }
  
  /*assign an instance to a given entry*/
  assignInstanceToEntry( instance ){
  
    var partId = instance.userData.part.partId;
    
    this._unRegisterInstanceFromBom( partId, instance );
    this._registerInstanceInBom( partId, instance );
  }
  
  
}


//object mixin testing
/*
Object.assign(Bom.prototype, {
    testMethod(arg1) {
      console.log("testing one two");
    }
});*/

export default Bom;
