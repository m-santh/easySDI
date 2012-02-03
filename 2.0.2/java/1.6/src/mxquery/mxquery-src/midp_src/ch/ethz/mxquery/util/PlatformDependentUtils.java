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

package ch.ethz.mxquery.util;

import ch.ethz.mxquery.datamodel.types.TypeLexicalConstraints;
import ch.ethz.mxquery.exceptions.DynamicException;
import ch.ethz.mxquery.exceptions.ErrorCodes;
import ch.ethz.mxquery.exceptions.QueryLocation;

public class PlatformDependentUtils {
	/**
	 * Expand characters that cannot be part of XML into character references
	 * Wrapper to discern between Java 5 methods (Unicode 4) and Java 1.4.2/CLDC
	 * @param val String to expand
	 * @param attribute Is val part of attribute, if yes also expand tab and linebreak
	 * @return
	 */
	public static StringBuffer expandCharRef(String val, boolean attribute) {
		StringBuffer translated = new StringBuffer();
		
		for (int i=0;i<val.length();i++) {
			int cp = val.charAt(i);
		    if (((cp == 0x9 || cp == 0xA)&& attribute) || cp == 0xD) {
				translated.append("&#x");
				translated.append(Integer.toHexString(cp).toUpperCase());
				translated.append(";");
			} else
				translated.append(val.charAt(i));
		}
		return translated;
	}
	
	/**
	 * Translate from codepoint to code units/characters
	 * Wrapper to discern between Java 5 methods (Unicode 4) and Java 1.4.2/CLDC
	 * @param codePoint codepoint to bring into 
	 * @return char [] containing code units
	 */
	
	public static char [] codepointToChars (int codePoint) {
		return new char[] {(char)codePoint};
	}
		


}