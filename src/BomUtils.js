  _registerPartMeshInstance: function( mesh ){
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
    console.log("assembly", this.assembly);
  },
