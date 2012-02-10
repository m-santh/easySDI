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

package ch.ethz.mxquery.model;

import java.util.Vector;

import ch.ethz.mxquery.contextConfig.Context;
import ch.ethz.mxquery.datamodel.xdm.Token;
import ch.ethz.mxquery.exceptions.MXQueryException;
import ch.ethz.mxquery.exceptions.QueryLocation;

/**
 * 
 * @author David Alexander Graf
 *
 */
public class EmptySequenceIterator extends CurrentBasedIterator {
		
	public EmptySequenceIterator(Context ctx, QueryLocation location){
		super(ctx, location);
		exprCategory = XDMIterator.EXPR_CATEGORY_VACUOUS;
	}

	public Token next() throws MXQueryException {
		return Token.END_SEQUENCE_TOKEN;
	}
	
	protected XDMIterator copy(Context context, XDMIterator[] subIters, Vector nestedPredCtxStack) throws MXQueryException {
		return new EmptySequenceIterator(context, loc);
	}	
}