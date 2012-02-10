/*   Copyright 2006 - 2009 ETH Zurich 
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

package ch.ethz.mxquery.datamodel.xdm;

import ch.ethz.mxquery.datamodel.Identifier;
import ch.ethz.mxquery.datamodel.QName;
import ch.ethz.mxquery.datamodel.types.Type;
import ch.ethz.mxquery.exceptions.MXQueryException;

public final class BooleanToken extends Token {
	private final boolean value;

	public static final BooleanToken TRUE_TOKEN = new BooleanToken(null,true, null);
	public static final BooleanToken FALSE_TOKEN = new BooleanToken(null,false,null);
	
	BooleanToken(Identifier id, boolean value, XDMScope scope) {
		super(Type.BOOLEAN, id, scope);
		this.value = value; 
	}
	
	BooleanToken(BooleanToken token) {
		super(token);
		this.value = token.getBoolean();
	}
	
	public boolean getBoolean() {
		return this.value;
	}
	
	public String getValueAsString() {
		return String.valueOf(this.value);
	}
	public Token toAttrToken(QName name, XDMScope scope) throws MXQueryException {
		BooleanAttrToken tempToken = new BooleanAttrToken(null,value, name,scope);
		return tempToken;
	}	
	
	public Token copy() {
		return new BooleanToken(this);
	}
}