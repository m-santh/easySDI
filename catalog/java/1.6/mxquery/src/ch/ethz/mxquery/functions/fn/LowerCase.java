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
package ch.ethz.mxquery.functions.fn;

import java.util.Vector;

import ch.ethz.mxquery.contextConfig.Context;
import ch.ethz.mxquery.datamodel.types.Type;
import ch.ethz.mxquery.datamodel.types.TypeInfo;
import ch.ethz.mxquery.datamodel.xdm.TextToken;
import ch.ethz.mxquery.datamodel.xdm.Token;
import ch.ethz.mxquery.exceptions.ErrorCodes;
import ch.ethz.mxquery.exceptions.MXQueryException;
import ch.ethz.mxquery.exceptions.TypeException;
import ch.ethz.mxquery.model.TokenBasedIterator;
import ch.ethz.mxquery.model.XDMIterator;

public class LowerCase extends TokenBasedIterator {

	protected void init() throws MXQueryException {
		XDMIterator input = subIters[0];
		Token inputToken =input.next();
		int type = Type.getEventTypeSubstituted( inputToken.getEventType(), Context.getDictionary() );
		
		switch (type) {
		case(Type.END_SEQUENCE):
			currentToken = new TextToken(null, "");
			break;
		case(Type.STRING):
		case(Type.UNTYPED_ATOMIC):
		case Type.UNTYPED:
			String res = inputToken.getText();
		currentToken = new TextToken(null, res.toLowerCase());
			break;
		default:
			throw new TypeException(ErrorCodes.F0028_INVALID_ARGUMENT_TYPE, "Invalid argument type"+Type.getTypeQName(type, Context.getDictionary()), loc);
		}
	}
	public TypeInfo getStaticType() {
		return new TypeInfo(Type.STRING,Type.OCCURRENCE_IND_EXACTLY_ONE,null,null);
	}	
	
	protected XDMIterator copy(Context context, XDMIterator[] subIters, Vector nestedPredCtxStack) throws MXQueryException {
		XDMIterator copy = new LowerCase();
		copy.setContext(context, true);
		copy.setSubIters(subIters);
		return copy;	
	}
}