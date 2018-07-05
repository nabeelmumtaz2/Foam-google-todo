/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

if ( ! this.FOAM_BOOT_DIR ) {
  var path = document.currentScript.src;
  path = path.substring(0, path.lastIndexOf('/')+1);

  FOAM_BOOT_DIR = path;
}

document.writeln('<script type="text/javascript" src="' + FOAM_BOOT_DIR + 'FOAMViewlessModels.js"></script>\n');
document.writeln('<script type="text/javascript" src="' + FOAM_BOOT_DIR + 'bootFOAMMain.js"></script>\n');
