/**
 * EasySDI, a solution to implement easily any spatial data infrastructure
 * Copyright (C) 2008 DEPTH SA, Chemin d�Arche 40b, CH-1870 Monthey, easysdi@depth.ch 
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or 
 * any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/gpl.html. 
 */
package ch.depth.proxy.core;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.Vector;
import java.util.zip.GZIPInputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import ch.depth.proxy.policy.Attribute;
import ch.depth.proxy.policy.AvailabilityPeriod;
import ch.depth.proxy.policy.FeatureType;
import ch.depth.proxy.policy.Layer;
import ch.depth.proxy.policy.Operation;
import ch.depth.proxy.policy.Policy;
import ch.depth.proxy.policy.Server;
import ch.depth.xml.documents.RemoteServerInfo;

public abstract class ProxyServlet extends HttpServlet {

    private static final long serialVersionUID = 3499090220094877198L;
    private static final String PNG = "image/png";
    private static final String GIF = "image/gif";
    private static final String JPG = "image/jpg";
    private static final String JPEG = "image/jpeg";
    private static final String TIFF = "image/tiff";
    private static final String HTML = "text/html";
    private static final String PLAIN = "text/plain";
    private static final String BMP = "image/bmp";
    protected static final String XML = "text/xml";
    protected static final String APPLICATION_XML = "application/xml";
    protected static final String XML_OGC_WMS = "application/vnd.ogc.wms_xml";
    protected static final String XML_OGC_EXCEPTION = "application/vnd.ogc.se_xml";
    protected static final String  SVG = "image/svg+xml";
    private List<String> temporaryFileList= new Vector();

    protected ch.depth.xml.documents.Config configuration; 

    protected Policy policy;
    protected String responseContentType=null; 
    protected String bbox = null;
    protected String srsName = null;
    protected Vector<String> filePathList = new Vector<String>();
    protected Vector<String> layerFilePathList = new Vector<String>();
    protected Vector<String> featureTypePathList = new Vector<String>();


    private List<String> lLogs = new Vector<String>();
    protected boolean hasPolicy = true;
    //protected String prefix = "SRV";

    protected List<RemoteServerInfo> getRemoteServerInfoList() {
	if (configuration == null) return null;	

	return configuration.getRemoteServer();
    }

    protected RemoteServerInfo getRemoteServerInfo(int i) {
	if (configuration == null) return null;

	List<RemoteServerInfo> l = configuration.getRemoteServer();
	if (l != null && l.size() >0){
	    return (RemoteServerInfo)l.get(i);
	}
	return null;
    }

    protected String getRemoteServerUrl(int i) {
	if (configuration == null) return null;

	List<RemoteServerInfo> l = configuration.getRemoteServer();
	if (l != null && l.size() >0){
	    return (String)((RemoteServerInfo)l.get(i)).getUrl();
	}
	return null;
    }

    protected String getPolicyFilePath() {
	return configuration.getPolicyFile();
    }
    public void setConfiguration (ch.depth.xml.documents.Config conf){
	configuration =  conf;	
    }

    /**
     * Get the policy file Search for the policy file path in attribute of the
     * servlet : policy-file if not found search for the file
     * policy-servletname.xml
     * 
     * @param req
     * @return
     */
    protected String getPolicyFile(ServletConfig config) {
	String policyFile = (String) config.getInitParameter("policy-file");
	if (policyFile == null)
	    policyFile = "policy.xml";
	return policyFile;
    }

    public void doPost(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {
	//Get the date and time of the request
	//lLogs = null;

	DateFormat dateFormat = new SimpleDateFormat(configuration.getLogDateFormat());
	Date d = new Date();	
	try{
	    requestPreTreatmentPOST(req, resp);
	}
	finally{
	    deleteTempFileList();
	}
	writeInLog(dateFormat.format(d),req);
    }

    public void doGet(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {
	//lLogs = null;
	//Get the date and time of the request
	DateFormat dateFormat = new SimpleDateFormat(configuration.getLogDateFormat());
	Date d = new Date();	

	try{	
	    requestPreTreatmentGET(req,  resp);
	}finally{
	    deleteTempFileList();
	}
	writeInLog(dateFormat.format(d),req);
    }

    protected abstract void requestPreTreatmentPOST(HttpServletRequest req, HttpServletResponse resp);    
    protected abstract void requestPreTreatmentGET(HttpServletRequest req, HttpServletResponse resp);
    /*protected abstract void transform(HashMap<String,String> env,  HttpServletRequest req,
	    HttpServletResponse resp, String filePath) ;*/



    /**
     * Builds the url from the request
     * 
     * @param req
     *                the HttpServletRequest request
     * @return returns the url
     */
    protected String getServletUrl(HttpServletRequest req) {
	// http://hostname.com:80/mywebapp/servlet/MyServlet/a/b;c=123?d=789
	if (configuration.getHostTranslator()!=null && configuration.getHostTranslator().length()>0){
	    return configuration.getHostTranslator();
	} 
	String scheme = req.getScheme(); // http
	String serverName = req.getServerName(); // hostname.com
	int serverPort = req.getServerPort(); // 80
	String contextPath = req.getContextPath(); // /mywebapp
	String servletPath = req.getServletPath(); // /servlet/MyServlet
	String pathInfo = req.getPathInfo(); // /a/b;c=123
	// String queryString = req.getQueryString(); // d=789

	String url = scheme + "://" + serverName + ":" + serverPort
	+ contextPath + servletPath;
	if (pathInfo != null) {
	    url += pathInfo;
	}

	return url;
    }

    private void writeInLog(String date, HttpServletRequest req){
	boolean newLog=false;
	String u="";	
	if (req.getUserPrincipal()!=null){
	    u = req.getUserPrincipal().getName();
	}

	try{  
	    String logFile = configuration.getLogFile();
	    if (logFile!=null){
		File fLogFile = new File(logFile);
		if (!fLogFile.exists()){	  
		    fLogFile.createNewFile();
		    newLog=true;    
		}

		FileWriter fstream = new FileWriter(fLogFile,true);
		BufferedWriter bWriter = new BufferedWriter(fstream);


		dump("SYSTEM","RemoteAddr",req.getRemoteAddr());	
		dump("SYSTEM","RemoteUser",req.getRemoteUser());
		dump("SYSTEM","QueryString",req.getQueryString());
		dump("SYSTEM","RequestURL",req.getRequestURL());

		if (newLog)bWriter.write("<Log>");
		bWriter.write("<LogRequest user=\""+u+"\" requestTime=\""+date+"\"> \n");
		synchronized (lLogs) {
		    for( Iterator<String> i = lLogs.iterator(); i.hasNext();){
			bWriter.write(i.next()+"\n");
		    } 
		}
		bWriter.write("</LogRequest>"+"\n");
		bWriter.close();}
	    else{
		String sHeader = "<LogRequest user=\""+u+"\" requestTime=\""+date+"\">"+"\n";
		System.err.println(sHeader);
		synchronized (lLogs) {
		    for( Iterator<String> i = lLogs.iterator(); i.hasNext();){
			System.err.println(i.next()+"\n");
		    } 
		}
		System.err.println("</LogRequest>"+"\n");
	    }
	}
	catch(Exception e){
	    e.printStackTrace();
	    String sHeader = "<LogRequest user=\""+u+"\" requestTime=\""+date+"\">"+"\n";
	    System.err.println(sHeader);
	    synchronized (lLogs) {
		for( Iterator<String> i = lLogs.iterator(); i.hasNext();){
		    System.err.println(i.next()+"\n");
		} 
	    }
	    System.err.println("</LogRequest>"+"\n");	    	    

	}

    }
    protected void dump(String severity, String name ,Object o) {
	dump(severity,name,""+o);	
    }
    protected void dump(String severity, String name ,int sb) {
	dump(severity,name,""+sb);

    }
    protected void dump(String severity, String name ,StringBuffer sb) {
	if (sb!=null) dump(severity,name,sb.toString());
	else dump(severity,name,"null");
    }
    protected void dump(String severity, String name ,String s) {
	if (severity==null) severity="DEBUG";
	if (s==null) s="null";
	StringBuffer sb = new StringBuffer();		

	DateFormat dateFormat = new SimpleDateFormat(configuration.getLogDateFormat());
	Date d = new Date();

	sb.append("<logEntry time=\""+dateFormat.format(d)+"\" severity=\""+ severity+"\"");
	if (name!=null){
	    sb.append(" name=\"");
	    sb.append(name);
	    sb.append("\"");
	}
	sb.append(">");
	sb.append(s);
	sb.append("</logEntry>");

	synchronized (lLogs) {	    	
	    if (lLogs==null) lLogs=new Vector<String>();
	    lLogs.add(sb.toString());
	}
    }
    protected void dump(String s, String s2) {
	if (s2!=null)dump(s, null,s2);
	else dump(s, null,"null");

    }

    protected void dump(String s, Object o) {
	if (o!=null)dump(s, o.toString());
	else dump(s, "null");

    }

    protected void dump(Object o) {
	if (o!=null)dump("INFO", o.toString());
	else dump("INFO", "null");
    }

    protected void dump(String s, Double d) {
	dump(s, d.toString());
    }

    protected void dump(Double d) {
	dump("INFO", d.toString());
    }
    protected void dump(String s,double d) {
	dump(s, Double.toString(d));
    }
    protected void dump(double d) {
	dump("INFO", Double.toString(d));
    }
    /***************************************************************************
     * Dump the string into the log file with the info severity
     * 
     * @param s
     *                the String to dump
     */
    protected void dump(String s) {
	if (s!=null) dump("INFO", s);
	else dump("INFO","null");
    }

    /***************************************************************************
     * Dump the stringBuffer into the log file with the info severity
     * 
     * @param s
     *                the StringBuffer to dump
     */
    protected void dump(StringBuffer s) {
	if (s!=null)dump(s.toString());
	else dump("null");
    }

    /***************************************************************************
     * Dump the stringBuffer into the log file
     * 
     * @param s
     *                the StringBuffer to dump
     */
    protected void dump(String severity, StringBuffer s) {
	if (s!=null) dump(severity, s.toString());
	else dump(severity, "null");
    }

    /**
     * Sends parameters to a remote server
     * 
     * @param method
     *                GET or POST method
     * @param urlstr
     *                remote server url
     * @param parameters
     *                parameters to send to the remote server
     * @return a String containing the path to the file containing the response from the remote server
     * @throws IOException
     */

    protected String sendData(String method, String urlstr,
	    String parameters) {
	try {
	    if (urlstr!=null){
		if (urlstr.endsWith("?")){
		    urlstr =urlstr.substring(0, urlstr.length()-1);
		}
	    }
	    DateFormat dateFormat = new SimpleDateFormat(configuration.getLogDateFormat());
	    Date d = new Date();	
	    dump("SYSTEM","RemoteRequestUrl",urlstr);
	    dump("SYSTEM","RemoteRequest",parameters);
	    dump("SYSTEM","RemoteRequestLength",parameters.length());
	    dump("SYSTEM","RemoteRequestDateTime",dateFormat.format(d));
	    String cookie = null;

	    if (getLoginService(urlstr) != null) {
		cookie = geonetworkLogIn(getLoginService(urlstr));
	    }


	    String encoding =null;

	    if (getUsername(urlstr) != null && getPassword(urlstr) != null) {
		String userPassword = getUsername(urlstr) + ":" + getPassword(urlstr);
		encoding = new sun.misc.BASE64Encoder()
		.encode(userPassword.getBytes());

	    }

	    if (method.equalsIgnoreCase("GET")) {	

		urlstr = urlstr + "?" + parameters;

	    }
	    URL url = new URL(urlstr);
	    HttpURLConnection hpcon = null;

	    hpcon = (HttpURLConnection) url.openConnection();
	    hpcon.setRequestMethod(method);
	    if (cookie != null) {
		hpcon.addRequestProperty("Cookie", cookie);
	    }
	    if (encoding!=null){
		hpcon.setRequestProperty("Authorization", "Basic " + encoding);
	    }
	    hpcon.setUseCaches(false);
	    hpcon.setDoInput(true);

	    if (method.equalsIgnoreCase("POST")) {
		hpcon.setRequestProperty("Content-Length", ""
			+ Integer.toString(parameters.getBytes().length));
		//hpcon.setRequestProperty("Content-Type", contentType);
		hpcon.setRequestProperty("Content-Type", "text/xml");

		hpcon.setDoOutput(true);
		DataOutputStream printout = new DataOutputStream(hpcon
			.getOutputStream());
		printout.writeBytes(parameters);
		printout.flush();
		printout.close();
	    } else {
		hpcon.setDoOutput(false);
	    }

	    // getting the response is required to force the request, otherwise
	    // it might not even be sent at all
	    InputStream in= null;

	    if (hpcon.getContentEncoding() != null && hpcon.getContentEncoding().indexOf("gzip") != -1) { 
		in = new GZIPInputStream(hpcon.getInputStream());
		dump("DEBUG","return of the remote server is zipped");
	    }else{
		in= hpcon.getInputStream();
	    }

	    int input;

	    responseContentType = hpcon.getContentType();	    	    
	    String tmpDir = System.getProperty("java.io.tmpdir");
	    dump (" tmpDir :  "+tmpDir);

	    File tempFile = createTempFile(UUID.randomUUID().toString(), getExtension(responseContentType));

	    FileOutputStream tempFos = new FileOutputStream(tempFile);

	    byte[] buf = new byte[32768];
	    int nread;	    	    

	    while((nread = in.read(buf, 0, buf.length)) >= 0) {
		tempFos.write(buf, 0, nread);	       
	    }		    

	    tempFos.flush();
	    tempFos.close();
	    in.close();	 
	    dump("SYSTEM","RemoteResponseLength",tempFile.length());

	    dateFormat = new SimpleDateFormat(configuration.getLogDateFormat());
	    d = new Date();	
	    dump("SYSTEM","RemoteResponseDateTime",dateFormat.format(d));
	    return tempFile.toString();

	} catch (Exception e) {
	    e.printStackTrace();
	    return null;

	    // throw new IOException(e.getMessage());
	}
    }


    protected String geonetworkLogIn (String loginServiceUrl){

	String cookie = null;
	//dump("SYSTEM","LoginServiceUrl",loginServiceUrl);
	try{
	    URL urlLoginService = new URL(loginServiceUrl);
	    HttpURLConnection hpconLoginService = null;
	    hpconLoginService = (HttpURLConnection) urlLoginService
	    .openConnection();
	    hpconLoginService.setRequestMethod("GET");
	    hpconLoginService.setUseCaches(false);
	    hpconLoginService.setDoInput(true);
	    hpconLoginService.setDoOutput(false);

	    BufferedReader inLoginService = new BufferedReader(
		    new InputStreamReader(hpconLoginService
			    .getInputStream()));
	    String inputLoginService;
	    cookie = hpconLoginService.getHeaderField("Set-Cookie");

	    while ((inputLoginService = inLoginService.readLine()) != null) {
		// dump(inputLoginService);
	    }
	    inLoginService.close();
	}catch (Exception e){
	    e.printStackTrace();
	}

	return cookie;

    }


    /*
     * Send a file using mulipart/form-data
     *  @param urlstr the url where to send
     *  @param filePath the path of the file to send
     *  @param loginServiceUrl Url to log in If needed
     *  @param parameterName The name of the file paramater
     *  @param parameterFileName The name of the file that will be published in the request  
     */
    protected StringBuffer sendFile(String urlstr, String filePath, String loginServiceUrl,String parameterName,String parameterFileName) {
	try{
	    InputStream is = new FileInputStream(filePath);
	    return sendFile( urlstr,is , loginServiceUrl,parameterName,parameterFileName) ;
	}catch (Exception e){
	    e.printStackTrace();
	}
	return new StringBuffer();
    }

    protected StringBuffer sendFile(String urlstr, InputStream in, String loginServiceUrl,String parameterName,String parameterFileName) {

	try{
	    String cookie = null;
	    if (loginServiceUrl!=null) {		    
		cookie = geonetworkLogIn(loginServiceUrl);
	    }

	    URL url = new URL(urlstr);
	    HttpURLConnection hpcon = null;

	    hpcon = (HttpURLConnection) url.openConnection();
	    hpcon.setRequestMethod("POST");
	    hpcon.addRequestProperty("Cookie", cookie);

	    hpcon.setUseCaches(false); 
	    hpcon.setDoInput(true);
	    hpcon.setDoOutput(true);


	    Random random = new Random();

	    String boundary = "---------------------------" + Long.toString(random.nextLong(), 36) + Long.toString(random.nextLong(), 36) + Long.toString(random.nextLong(), 36);
	    hpcon.setRequestProperty("Content-Type","multipart/form-data; boundary=" + boundary);

	    hpcon.connect();	    
	    DataOutputStream os = new DataOutputStream(hpcon.getOutputStream());

	    String s1 = "--" +boundary +"\r\ncontent-disposition: form-data; name=\"" +parameterName +"\"; filename=\"" +parameterFileName +"\"\r\nContent-Type: application/octet-stream\r\n\r\n";

	    os.writeBytes(s1);		

	    byte[] buf = new byte[32768];
	    int nread;	    	    
	    synchronized (in) {
		while((nread = in.read(buf, 0, buf.length)) >= 0) {
		    os.write(buf, 0, nread);	       
		}
	    }
	    os.flush();

	    String boundar = "\r\n--" +boundary +"--";
	    os.writeBytes(boundar);	   	        
	    buf = null;	   
	    os.close();
	    in= null;
	    if (hpcon.getContentEncoding() != null && hpcon.getContentEncoding().indexOf("gzip") != -1) { 
		in = new GZIPInputStream(hpcon.getInputStream());		
	    }else{
		in= hpcon.getInputStream();
	    }	    	    	    
	    BufferedReader br = new BufferedReader(
		    new InputStreamReader(in));

	    String input;
	    StringBuffer response= new StringBuffer();
	    while ((input = br.readLine()) != null) {
		response.append(input);			    
	    }  	    	    	    
	    return response;    
	}catch(Exception e){
	    e.printStackTrace();
	}   
	return new StringBuffer();
    }



    protected StringBuffer send( String urlstr, String loginServiceUrl) {
	try {

	    String cookie = null;
	    if (loginServiceUrl != null) {
		cookie = geonetworkLogIn(loginServiceUrl);
	    }

	    URL url = new URL(urlstr);
	    HttpURLConnection hpcon = null;

	    hpcon = (HttpURLConnection) url.openConnection();
	    hpcon.setRequestMethod("GET");
	    if (cookie != null) {
		hpcon.addRequestProperty("Cookie", cookie);
	    }


	    hpcon.setUseCaches(false);
	    hpcon.setDoInput(true);

	    hpcon.setDoOutput(false);


	    // getting the response is required to force the request, otherwise
	    // it might not even be sent at all
	    InputStream in= null;

	    if (hpcon.getContentEncoding() != null && hpcon.getContentEncoding().indexOf("gzip") != -1) { 
		in = new GZIPInputStream(hpcon.getInputStream());
	    }else{
		in= hpcon.getInputStream();
	    }




	    BufferedReader br = new BufferedReader(
		    new InputStreamReader(in));

	    String input;
	    StringBuffer response= new StringBuffer();
	    while ((input = br.readLine()) != null) {
		response.append(input);			    
	    }  	    	    	    
	    return response;



	} catch (Exception e) {
	    e.printStackTrace();	    
	}
	return new StringBuffer();
    }


    protected boolean isAcceptingTransparency(String responseContentType) {		
	boolean isTransparent = true;
	if (responseContentType== null) return true;
	if (isXML(responseContentType)){
	    isTransparent = false;
	}else if (responseContentType.startsWith(PNG)){
	    isTransparent = true;
	}else if (responseContentType.startsWith(SVG)){
	    isTransparent = true;   
	}else if (responseContentType.startsWith(GIF)){
	    isTransparent = true;   
	}else if (responseContentType.startsWith(JPG)){
	    isTransparent = false;   
	}else if (responseContentType.startsWith(JPEG)){
	    isTransparent = false;   
	}else if (responseContentType.startsWith(TIFF)){
	    isTransparent = true;   
	}else if (responseContentType.startsWith(BMP)){
	    isTransparent = false;    
	}else{
	    dump("unkwnon content type"+responseContentType);
	}

	return isTransparent;
    }

    /**
     * @param responseContentType2
     * @return
     */
    protected String getExtension(String responseContentType) {		
	String ext = ".unk";
	if (responseContentType== null) return ext;
	if (isXML(responseContentType)){
	    ext = ".xml";
	}else if (responseContentType.startsWith(PNG)){
	    ext = ".png";
	}else if (responseContentType.startsWith(SVG)){
	    ext = ".svg";	    
	}else if (responseContentType.startsWith(GIF)){
	    ext = ".gif";	    
	}else if (responseContentType.startsWith(JPG)){
	    ext = ".jpg";	    
	}else if (responseContentType.startsWith(JPEG)){
	    ext = ".jpeg";	    
	}else if (responseContentType.startsWith(TIFF)){
	    ext = ".tiff";	    
	}else if (responseContentType.startsWith(BMP)){
	    ext = ".bmp";	    
	}else{
	    dump("unkwnon content type"+responseContentType);
	}

	return ext;
    }

    protected File createTempFile(String name , String ext){
	try{
	    File f = File.createTempFile(name, ext);
	    temporaryFileList.add(f.toURI().toString());
	    return f;
	}catch(Exception e){
	    e.printStackTrace();
	    return null;
	}

    }

    protected void deleteTempFileList(){
	
	
	try{
	    for (int i = 0;i<temporaryFileList.size();i++){
		File f = new File(new URI(temporaryFileList.get(i)));
		if (f.exists()) {
		    boolean deleted = f.delete();
		    if (deleted) dump ("INFO","temporary file "+f.toURI().toString()+" is deleted");
		    else {
			f.deleteOnExit();
			dump ("WARNING","temporary file "+f.toURI().toString()+" is not deleted");		    
		    }
		}

	    }	    
	    temporaryFileList.clear();
	}catch(Exception e){
	    e.printStackTrace();	    
	}

    }

    protected boolean isXML(String responseContentType){
	if (responseContentType==null ) return false;

	if (responseContentType.startsWith(XML) || 
		responseContentType.startsWith(XML_OGC_WMS) || 
		responseContentType.startsWith(XML_OGC_EXCEPTION) ||
		responseContentType.startsWith(APPLICATION_XML)) return true;
	return false;

    }

    /**
     * @param urlstr
     * @return
     */
    protected Object getUsername(String urlstr) {

	List<RemoteServerInfo> serverInfoList = configuration.getRemoteServer();
	Iterator<RemoteServerInfo> it =  serverInfoList.iterator();
	while( it.hasNext()){
	    RemoteServerInfo serverInfo = it.next();
	    if (serverInfo.getUrl().equals(urlstr)) return serverInfo.getUser();
	}

	return null;
    }

    protected StringBuffer  generateOgcError(String errorMessage){
	StringBuffer sb = new StringBuffer ("<?xml version='1.0' encoding='utf-8' ?>");
	sb.append("<ServiceExceptionReport xmlns=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/ogc\" version=\"1.2.0\">");
	sb.append("<ServiceException>");
	sb.append(errorMessage);
	sb.append("</ServiceException>");
	sb.append("</ServiceExceptionReport>");
	return sb;  
    }

    /**
     * @param urlstr
     * @return
     */
    protected Object getPassword(String urlstr) {
	List<RemoteServerInfo> serverInfoList = configuration.getRemoteServer();
	Iterator<RemoteServerInfo> it =  serverInfoList.iterator();
	while( it.hasNext()){
	    RemoteServerInfo serverInfo = it.next();
	    if (serverInfo.getUrl().equals(urlstr)) return serverInfo.getPassword();
	}

	return null;
    }

    /**
     * @return
     */
    private String getLoginService(String urlstr) {
	List<RemoteServerInfo> serverInfoList = configuration.getRemoteServer();
	Iterator<RemoteServerInfo> it =  serverInfoList.iterator();
	while( it.hasNext()){
	    RemoteServerInfo serverInfo = it.next();
	    if (serverInfo.getUrl().equals(urlstr)) return serverInfo.getLoginService();
	}
	return null;
    }

    public ch.depth.xml.documents.Config getConfiguration() {
	return configuration;
    }

    public Policy getPolicy() {	
	return this.policy;
    }

    public void setPolicy(Policy p) {
	this.policy = p;
    }

    /**
     * If the operation is allowed in the policy then return true, in any other case return false.
     * @param operation the operation to check
     * @return true | false. 
     */
    protected boolean isOperationAllowed (String operation){
	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}

	if (policy.getOperations().isAll()) return true;
	List<Operation> operationList = policy.getOperations().getOperation();
	for (int i=0;i<operationList.size();i++){
	    if (operation.equalsIgnoreCase(operationList.get(i).getName())) return true;
	}	
	return false;
    }

    /**
     * Detects if the feature type is allowed or not against the rule. 
     * @param ft The feature Type to test
     * @param url the url of the remote server.
     * @return true if the feature type is allowed, false if not
     */
    protected boolean isFeatureTypeAllowed (String ft,String url){
	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}


	boolean isServerFound = false;	
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		isServerFound=true;
		//Are all feature Types Allowed ?
		if (serverList.get(i).getFeatureTypes().isAll()) return true;

		List<FeatureType> ftList = serverList.get(i).getFeatureTypes().getFeatureType();
		for (int j=0;j<ftList.size();j++){
		    //Is a specific feature type allowed ? 
		    if (ft.equals(ftList.get(j).getName())) return true;		    
		}

	    }
	}	
	//if the server is not overloaded and if all the servers are allowed then 
	//We can consider that's ok
	if (!isServerFound && policy.getServers().isAll()) return true;

	//in any other case the feature type is not allowed
	return false;
    }

    /**
     * Detects if the layer is allowed or not against the rule. 
     * @param layer The layer to test
     * @param url the url of the remote server.
     * @return true if the layer is allowed, false if not
     */
    protected boolean isLayerAllowed (String layer,String url){
	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}

	if (layer == null )return false;

	boolean isServerFound = false;	
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		isServerFound=true;
		//Are all layers Allowed ?
		if (serverList.get(i).getLayers().isAll()) return true;

		List<Layer> layerList = serverList.get(i).getLayers().getLayer();
		for (int j=0;j<layerList.size();j++){		    
		    //Is a specific layer allowed ? 
		    if (layer.equals(layerList.get(j).getName())) return true; 
		}

	    }
	}
	//if the server is not overloaded and if all the servers are allowed then 
	//We can consider that's ok
	if (!isServerFound && policy.getServers().isAll()) return true;

	//in any other case the feature type is not allowed
	return false;
    }
    /**
     * Detects if the layer is an allowed or not against the rule. 
     * @param layer The layer to test
     * @param url the url of the remote server.
     * @param scale the current scale
     * @return true if the layer is the allowed scale, false if not
     */
    protected boolean isLayerInScale (String layer,String url,double scale){
	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}


	boolean isServerFound = false;	
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		isServerFound=true;
		//Are all layers Allowed ?
		if (serverList.get(i).getLayers().isAll()) return true;

		List<Layer> layerList = serverList.get(i).getLayers().getLayer();
		for (int j=0;j<layerList.size();j++){
		    //Is a specific layer allowed ? 
		    if (layer.equals(layerList.get(j).getName())) {
			Double scaleMin = layerList.get(j).getScaleMin();
			Double scaleMax = layerList.get(j).getScaleMax();

			if (scaleMin == null) scaleMin = new Double(0);
			if (scaleMax == null) scaleMax = new Double(Double.MAX_VALUE);
			if (scale>=scaleMin.doubleValue() && scale<=scaleMax.doubleValue())return true;
			else return false;
		    }
		}

	    }
	}	

	//if the server is not overloaded and if all the servers are allowed then 
	//We can consider that's ok
	if (!isServerFound && policy.getServers().isAll()) return true;

	//in any other case the feature type is not allowed
	return false;
    }


    /**
     * Detects if the attribute of a feature type is allowed or not against the rule. 
     * @param ft The feature Type to test
     * @param url the url of the remote server.
     * @return true if the feature type is allowed, false if not
     */
    protected boolean isAttributeAllowed (String url,String ft,String attribute){

	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}

	boolean isServerFound = false;
	boolean isFeatureTypeFound = false;
	boolean FeatureTypeAllowed = false;

	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		isServerFound=true;		
		List<FeatureType> ftList = serverList.get(i).getFeatureTypes().getFeatureType();
		FeatureTypeAllowed = serverList.get(i).getFeatureTypes().isAll();
		for (int j=0;j<ftList.size();j++){
		    //Is a specific feature type allowed ? 
		    if (ft.equals(ftList.get(j).getName())) {
			isFeatureTypeFound=true;			
			//If all the attribute are authorized, then return true;
			if (ftList.get(j).getAttributes().isAll()) return true;
			List<Attribute> attributeList = ftList.get(j).getAttributes().getAttribute();			
			for (int k=0;k<attributeList.size();k++){
			    if (attribute.equals(attributeList.get(k).getContent())) return true;
			}
		    } 
		}

	    }
	}	


	//if the server is not overloaded and if all the servers are allowed then 
	//We can say that's ok
	if (!isServerFound && policy.getServers().isAll()) return true;

	//if the server is overloaded and if the specific featureType was not overloaded and All the featuetypes are allowed 
	//We can say that's ok
	if (isServerFound && !isFeatureTypeFound && FeatureTypeAllowed) return true;

	//in any other case the feature type is not allowed
	return false;
    }

    protected String getLayerFilter(String layer){

	if (policy == null) return null;
	if (layer == null) return null;
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){

	    List<Layer> layerList = serverList.get(i).getLayers().getLayer();
	    for (int j=0;j<layerList.size();j++){
		//Is a specific feature type allowed ? 
		if (layer.equals(layerList.get(j).getName())) {
		    if (layerList.get(j).getFilter() == null) return null;
		    return layerList.get(j).getFilter().getContent();
		} 
	    }


	}	
	return null;
    }


    protected String getLayerFilter(String url,String layer){

	if (policy == null) return null;
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){

	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {


		List<Layer> layerList = serverList.get(i).getLayers().getLayer();
		for (int j=0;j<layerList.size();j++){
		    //Is a specific feature type allowed ? 
		    if (layer.equals(layerList.get(j).getName())) {
			if (layerList.get(j).getFilter() == null) return null;
			return layerList.get(j).getFilter().getContent();
		    } 
		}

	    }
	}	
	return null;
    }

    protected String getFeatureTypeLocalFilter(String url,String ft){

	if (policy == null) return null;
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){

	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {


		List<FeatureType> ftList = serverList.get(i).getFeatureTypes().getFeatureType();
		for (int j=0;j<ftList.size();j++){
		    //Is a specific feature type allowed ? 
		    if (ft.equals(ftList.get(j).getName())) {
			if (ftList.get(j).getLocalFilter() == null) return null;
			return ftList.get(j).getLocalFilter().getContent();
		    } 
		}

	    }
	}	
	return null;
    }
    protected String getFeatureTypeRemoteFilter(String url,String ft){

	if (policy == null) return null;
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){

	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {


		List<FeatureType> ftList = serverList.get(i).getFeatureTypes().getFeatureType();
		for (int j=0;j<ftList.size();j++){
		    //Is a specific feature type allowed ? 
		    if (ft.equals(ftList.get(j).getName())) {
			if (ftList.get(j).getRemoteFilter() == null) return null;
			return ftList.get(j).getRemoteFilter().getContent();
		    } 
		}
	    }
	}	
	return null;
    }

    protected boolean isSizeInTheRightRange(int currentWidth, int currentHeight){

	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}

	int minWidth = 0;
	int minHeight = 0;
	int maxWidth = Integer.MAX_VALUE;
	int maxHeight = Integer.MAX_VALUE; 
	if (policy.getImageSize()==null) return true;
	if (policy.getImageSize().getMinimum() !=null){
	    minWidth = policy.getImageSize().getMinimum().getWidth();
	    minHeight = policy.getImageSize().getMinimum().getHeight();
	}

	if (policy.getImageSize().getMaximum() !=null){
	    maxWidth = policy.getImageSize().getMaximum().getWidth();
	    maxHeight =  policy.getImageSize().getMaximum().getHeight();
	}

	if (currentWidth>=minWidth && currentWidth<= maxWidth && currentHeight>=minHeight && currentHeight<= maxHeight){
	    return true;
	}

	return false;
    }

    protected String getServerFilter(String url){
	if (policy == null) return null;
	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){

	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {

		if (serverList.get(i).getFilter() == null) return null;
		return serverList.get(i).getFilter().getContent();


	    }

	}
	return null;
    }

    /**
     * If the current date is not in the right date range returns an error
     * @param conf
     * @return
     * @throws NoPermissionException 
     */
    protected boolean isDateAvaillable(AvailabilityPeriod p) {
	if (policy == null) return false;
	SimpleDateFormat sdf = new SimpleDateFormat(p.getMask());
	Date fromDate = null;
	Date toDate = 	null;
	try{
	    if (p.getFrom()!=null) fromDate = sdf.parse(p.getFrom().getDate());
	    if (p.getTo()!=null) toDate = 	sdf.parse(p.getTo().getDate());
	}catch(Exception e){
	    e.printStackTrace();
	    return false;
	}
	Date currentDate = new Date();
	if (fromDate !=null) if (currentDate.before(fromDate)) return false;

	if (toDate !=null) if (!currentDate.before(toDate)) return false;

	return true;
    }

    protected List<String> getAttributesNotAllowedInMetadata(String url){
	List<String> attrList = new Vector<String>();

	if (policy == null) return attrList;

	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		if (serverList.get(i).getMetadata().getAttributes().isAll()) {
		    attrList.add("%");
		    return attrList;
		}
		List<Attribute> attrList2 = serverList.get(i).getMetadata().getAttributes().getExclude().getAttribute();
		for(int j=0;j<attrList2.size();j++){
		    attrList.add(attrList2.get(j).getContent());	
		}						
	    }
	}
	//in any other case the attribute is not allowed
	return attrList;
    }

    protected boolean isAttributeAllowedForMetadata(String url,String attribute){
	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}


	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		if (serverList.get(i).getMetadata().getAttributes().isAll()) return true;
		List<Attribute> attrList = serverList.get(i).getMetadata().getAttributes().getAttribute();
		for(int j=0;j<attrList.size();j++){
		    if (attribute.equals(attrList.get(j).getContent())){
			return true;
		    }				
		}						
	    }
	}	

	//in any other case the attribute is not allowed
	return false;
    }
    protected boolean areAllAttributesAllowedForMetadata(String url){
	if (policy == null) return false;
	if (policy.getAvailabilityPeriod() !=null) {
	    if (isDateAvaillable(policy.getAvailabilityPeriod())==false) return false;	    
	}


	List<Server> serverList = policy.getServers().getServer();

	for (int i=0;i<serverList.size();i++){
	    //Is the server overloaded?  
	    if (url.equalsIgnoreCase(serverList.get(i).getUrl())) {
		if (serverList.get(i) !=null && serverList.get(i).getMetadata()!=null && serverList.get(i).getMetadata().getAttributes()!=null){
		    if (serverList.get(i).getMetadata().getAttributes().isAll()) return true;
		    else return false;
		}
	    }
	}	

	//in any other case the attribute is not allowed
	return false;



    }
}