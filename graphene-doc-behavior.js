(function(window) {
    'use strict';
    //Init document.Graphene object
    window.Graphene = window.Graphene || {};
    window.Graphene._impl = window.Graphene._impl || {};
    window.Graphene.behaviors = window.Graphene.behaviors || {};

    window.Graphene._impl.doc = {
        //Public callable function

        fetchDoc: function(query) {
            return new Promise(function(query, resolve, reject) {
                query = query || this._docQuery;
                if (query !== null) {
                    this.fetch(query, null, null, null, true)
                        .then(this._onResponse.bind(this))
                        .then(resolve)
                        .catch(this._onError.bind(this))
                        .catch(reject);
                } else {
                    var err = new Error('Unresolved doc query, set actionName property before fetch');
                    reject(err);
                    console.warn(err.message);
                }
            }.bind(this, query));
        },

        //Private functions
        _getDocQuery: function(queryBase, detail, actionName) {
            if (actionName && queryBase) {
                return queryBase + '?action=' + actionName + '&detail=' + (detail ? 1 : 0);
            } else {
                return null;
            }
        },

        _docQueryChanged: function(query, auto) {
            //this.set('doc', null);
            this.fire('doc-invalidate');
            this._setDoc(undefined);
            if (auto && query) {
                this.fetchDoc(query)
            }
        },

        _onResponse: function(response) {
            this._setDoc(response);
            this.fire('doc-update', this.doc);
            //console.log(this.doc);
            return response;
        },

        _onError: function(err) {
            this._setDocError(err);
            this.fire('doc-error', err);
            //console.error(err);
            return err;
        },

        _getActionInterface: function(doc) {
            try {
                return !!doc.base ? doc.base.DocAction[0].interface || {} : null;
            } catch (ex) {
                return {};
            }
        },

        _getModelRequestProto: function(e) {
            try {
                return this._clearObj(e.base.DocAction[0]['request-data']);
            } catch (ex) {
                return {}
            }
        },

        _getModelResponseProto: function(e) {
            try {
                return this._clearObj(e.base.DocAction[0]['response-data']);
            } catch (ex) {
                return {}
            }
        },

        _clearObj: function(obj) {
            for (var key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = null;
                } else if (typeof obj[key] == 'object') {
                    obj[key] = this._clearObj(obj[key]);
                }
            }
            return obj;
        },

        observers: [
            '_docQueryChanged(_docQuery, auto)'
        ],

        properties: {
            //User settable properties
            actionName:   String,
            docDetail:    {type: Boolean, value: true},
            auto:         {type: Boolean, value: true},
            docQueryBase: {type: String, value: '/system/doc/'},

            //Doc results
            doc:             {type: Object, readOnly: true, notify: true},
            docError:        {type: Object, readOnly: true, notify: true},
            actionInterface: {type: Object, computed: '_getActionInterface(doc.*)'},
            requestProto:    {type: Object, computed: '_getModelRequestProto(doc.*)', notify: true},
            responseProto:   {type: Object, computed: '_getModelResponseProto(doc.*)', notify: true},

            //private properties
            _docQuery: {type: String, computed: '_getDocQuery(docQueryBase, docDetail, actionName)'}
        }
    };

    window.Graphene.behaviors.doc = [
        window.Graphene.behaviors.clientBehavior,
        window.Graphene._impl.doc
    ]
})(window);
