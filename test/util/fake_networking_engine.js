/**
 * @license
 * Copyright 2015 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('shaka.test.FakeNetworkingEngine');

goog.require('shaka.util.Uint8ArrayUtils');



/**
 * A fake networking engine that returns constant data.  The request member
 * is a jasmine spy and can be used to check the actual calls that occurred.
 *
 * @param {Object.<string, !ArrayBuffer>=} opt_responseMap A map from URI to
 *   the data to return.
 * @param {!ArrayBuffer=} opt_defaultResponse The default value to return; if
 *   null, a jasmine expect will fail if a request is made that is not in
 *   |opt_data|.
 *
 * @constructor
 * @struct
 * @extends {shaka.net.NetworkingEngine}
 */
shaka.test.FakeNetworkingEngine = function(
    opt_responseMap, opt_defaultResponse) {
  /** @private {!Object.<string, !ArrayBuffer>} */
  this.responseMap_ = opt_responseMap || {};

  /** @private {ArrayBuffer} */
  this.defaultResponse_ = opt_defaultResponse || null;

  // The prototype has already been applied; create a spy for the request
  // method but still call it by default.
  spyOn(this, 'request').and.callThrough();
};


/** @override */
shaka.test.FakeNetworkingEngine.prototype.request = function(type, request) {
  expect(request).toBeTruthy();
  expect(request.uris.length).toBe(1);

  var result = this.responseMap_[request.uris[0]] || this.defaultResponse_;
  if (!result) {
    // Give a more helpful error message to jasmine.
    expect(request.uris[0]).toBe('in the response map');
    return Promise.reject();
  }

  /** @type {shakaExtern.Response} */
  var response = {uri: request.uris[0], data: result, headers: {}};
  return Promise.resolve(response);
};


/**
 * Expects that a request for the given URI has occurred.
 *
 * @param {string} uri
 * @param {number} startByte
 * @param {?number} endByte
 */
shaka.test.FakeNetworkingEngine.prototype.expectRangeRequest = function(
    uri, startByte, endByte) {
  var range = 'bytes=' + startByte + '-';
  if (endByte != null) range += endByte;

  expect(this.request)
      .toHaveBeenCalledWith(
          shaka.net.NetworkingEngine.RequestType.SEGMENT,
          jasmine.objectContaining({
            uris: [uri],
            headers: jasmine.objectContaining({'Range': range})
          }));
};


/**
 * Sets the response map.
 *
 * @param {Object.<string, !ArrayBuffer>} responseMap
 */
shaka.test.FakeNetworkingEngine.prototype.setResponseMap = function(
    responseMap) {
  this.responseMap_ = responseMap;
};


/**
 * Sets the response map as text.
 *
 * @param {!Object.<string, string>} textMap
 */
shaka.test.FakeNetworkingEngine.prototype.setResponseMapAsText = function(
    textMap) {
  this.responseMap_ = Object.keys(textMap).reduce(function(obj, key) {
    var data = shaka.util.Uint8ArrayUtils.fromString(textMap[key]).buffer;
    obj[key] = data;
    return obj;
  }, {});
};


/**
 * Sets the default return value.
 *
 * @param {ArrayBuffer} defaultResponse The default value to return; or null to
 *   give an error for invalid URIs.
 */
shaka.test.FakeNetworkingEngine.prototype.setDefaultValue = function(
    defaultResponse) {
  this.defaultResponse_ = defaultResponse;
};


/**
 * Sets the default return value as text.
 *
 * @param {?string} defaultText The default value to return; or null to give an
 *   error for invalid URIs.
 */
shaka.test.FakeNetworkingEngine.prototype.setDefaultText = function(
    defaultText) {
  var data = null;
  if (value) {
    data = shaka.util.Uint8ArrayUtils.fromString(defaultText).buffer;
  }
  this.defaultResponse_ = data;
};