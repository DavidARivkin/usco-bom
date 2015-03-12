!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.uscoBom=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BomEntry = function BomEntry(name, description, version, amount, unit, parameters) {
  _classCallCheck(this, BomEntry);
};

var Bom = (function () {
  function Bom() {
    _classCallCheck(this, Bom);

    //TODO: ermmm bom within bom?
    this.bom = [];
  }

  _createClass(Bom, {
    registerPart: {

      //basic api

      value: function registerPart(partData, _x, instances) {
        var implementations = arguments[1] === undefined ? {} : arguments[1];

        var partDataDefaults = {
          name: "",
          description: "",
          version: "0.0.0",
          quantity: 0,
          physicalQuantity: 0, //this can be used for weight, distance etc
          unit: "EA",
          parameters: "",
          implementations: implementations
        };
      }
    },
    registerInstance: {

      /*
        register an instance 
      
      */

      value: function registerInstance(partId, instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.bom[partId];
        if (!bomEntry) throw new Error("bad partId specified");

        //console.log("registering", instance, "as instance of ", bomEntry.name );
        bomEntry._instances.push(instance);
        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty += 1;
      }
    },
    unRegisterInstance: {

      /*remove an instance 
      
      */

      value: function unRegisterInstance(partId, instance) {
        if (!instance) throw new Error("No instance given");
        var bomEntry = this.bom[partId];
        if (!bomEntry) throw new Error("bad partId specified");

        var index = bomEntry._instances.indexOf(instance);
        if (index == -1) {
          return;
        }bomEntry._instances.splice(index, 1);
        //FIXME can't we use the length of instances ? or should we allow for human settable variation
        bomEntry.qty -= 1;
      }
    },
    registerPartMeshInstance: {

      /* register a part mesh instance in the bom */

      value: function registerPartMeshInstance(mesh) {
        var userData = mesh.userData;
        var partId = mesh.userData.part.id; //FIXME : partID VS partInstanceID
        var instId = "";

        if (!this.partMeshInstances[partId]) {
          this.partMeshInstances[partId] = [];
        }
        this.partMeshInstances[partId].push(mesh);

        if (this.partWaiters[partId]) {
          console.log("resolving mesh for ", partId);
          this.partWaiters[partId].resolve(mesh);
        }

        //each instance needs a unique uid
        //FIXME: this should not be at the MESH level, so this is the wrong place for that   
        mesh.userData.part.instId = this.generateUUID();

        //FIXME: experimental hack , for a more data driven based approach

        var assemblyEntry = {
          partId: partId,
          instId: mesh.userData.part.instId,
          pos: mesh.position.toArray(),
          rot: mesh.rotation.toArray(),
          scale: mesh.scale.toArray()
        };
        this.assembly.children.push(assemblyEntry);
      }
    },
    registerImplementation: {

      /*
        Register an IMPLEMENTATIOn in the bom: 
        an implementation is a key-value pair : 
          *key : the SOURCE (a parametric file used
        to generate a mesh) 
          *value: the concrete 
          for example a mesh/ mesh file (stl , amf)
        
        why an implementation ? because an entity/part can be created in different
        software, different formats etc, it still remains the same entity
        
        for example :
          {"cad/case.scad":"cad/case-top-0.0.1.stl"}
      */

      value: function registerImplementation(meshUri, partName) {
        console.log("registering", meshUri, "as implementation of ", partName);
        if (!partName) throw new Error("no part name specified");

        var partIndex = -1;
        var bomEntry = null;

        for (var i = 0; i < this.bom.length; i++) {
          var entry = this.bom[i];
          partIndex = i;
          if (entry.name === partName) {
            bomEntry = entry;
            break;
          }
        }

        if (!bomEntry) {
          partIndex += 1;
          bomEntry = {
            id: partIndex,
            name: partName,
            description: "",
            version: "0.0.1",
            qty: 0,
            unit: "EA",
            url: "",
            implementations: { "default": meshUri },
            parameters: "",
            _instances: [],
            _instances2: {}
          };
          this.bom.push(bomEntry);
        }
        console.log("BOM", this.bom);
        return partIndex;
      }
    },
    isPartImplementationInBom: {

      //helpers and extras

      value: function isPartImplementationInBom(implementationName) {
        for (var i = 0; i < this.bom.length; i++) {
          var entry = this.bom[i];
          var implemNames = Object.keys(entry.implementations).map(function (key) {
            return entry.implementations[key];
          });

          if (implemNames.includes(implementationName)) {
            return true;
          }
          /*if(implemNames.indexOf( implementationName ) !== -1)
          {
            return true;
          }*/
        }
        return false;
      }
    },
    getPartNames: {

      /*retrieve all part names*/

      value: function getPartNames() {
        var partNames = this.bom.map(function (obj) {
          return obj.name;
        }); //return obj.name
        return partNames;
      }
    },
    addEmtpyEntry: {

      /*inject an empty entry */

      value: function addEmtpyEntry(partName, description) {
        partIndex = this.bom.length - 1;

        bomEntry = {
          id: partIndex,
          name: partName,
          description: "",
          version: "0.0.1",
          qty: 0,
          unit: "EA",
          url: "",
          implementations: { "default": "" },
          parameters: "",
          _instances2: {}
        };

        this.bom.push(bomEntry);
      }
    },
    assignInstanceToEntry: {

      /*assign an instance to a given entry*/

      value: function assignInstanceToEntry(instance) {

        var partId = instance.userData.part.partId;

        this._unRegisterInstanceFromBom(partId, instance);
        this._registerInstanceInBom(partId, instance);
      }
    }
  });

  return Bom;
})();

//object mixin testing
/*
Object.assign(Bom.prototype, {
    testMethod(arg1) {
      console.log("testing one two");
    }
});*/

module.exports = Bom;

/*this.name        = name;
this.description = "";
this.version     = "0.0.1";
this.amount      = 0;
this.unit        = "EA";
this.implementations = {};//"default":meshUri
this.parameters      = "";*/
//Object.assign(this, { x, y });

},{}]},{},[1])(1)
});