/******************************************************************************
Dokument......: 
Revision......: PA1
Datum.........: 010810
Fil...........: xmlparser.js
Författare....: JOBJ
Paket.........: WEB-Klienttillägg simple parser
Paketversion..: 0.1
Produktver....: 0.2
Språk.........: JavaScript
OS............: MSIE 5.0 
Beskrivning...:
  Denna fil innehåller en mall för filer i Java.
Ändringar.....:

  PA1 010528 JOBJ
    Första revisionen
	
  PA1 010827 JOBJ
    Revisionshantering införd	
	
  PA1 010830 JOBJ
    Omskriven getElement som rekurserar genom XML trädet.
	
  PA1 011030 JOBJ
  	Fixat bug med parsning av flera element i lista som kan ha döttrar.


******************************************************************************/

/* --------------------------------- Includes ---------------------------------------
XMLstr ex:
<ELEMENT attribute="attributedata">
	elementdata
	<CHILD_ELEMENT/>
</ELEMENT>

XMLpath = ELEMENT/[attribute]										Path to a specific element and, if necisary an attribute
elementPath = ELEMENT/CHILD_ELEMENT/								Path to a specific element, no attribute

functions:

getAttribute(XMLstr, XMLpath [, cond1, cond2, cond3])				Retrieves attributdata from elementpath as an array
setAttribute(XMLstr, XMLpath, attributes [, cond1, cond2, cond3])	Sets attributdata on element

getData(XMLstr, elementPath [, cond1, cond2, cond3])				Retrieves elementdata from elementpath
setData(XMLstr, elementPath, data  [, cond1, cond2, cond3])			Sets data into the element in elementpath, replaceing all other data in that element
addData(XMLstr, elementPath, data  [, cond1, cond2, cond3])			Adds data into the element in elementPath, before other data.

getXML(XMLstr, elementPath [, cond1, cond2, cond3])					Retrieves the content of element(s) specified by elementPath
addXML(XMLstr, elementPath, newXMLstr [, cond1, cond2, cond3])		Inserts newXMLstr into the element specified by elementPath
delXML(XMLstr, elementPath [, cond1, cond2, cond3])					Removes content from the element specified by elementPath

getElement(XMLstr, elementPath [,cond1, cond2, cond3])				Retrieves entier element(s) and its children/data as an array
getElements(XMLstr, elementPath [,cond1, cond2, cond3])				Retrieves entier element(s) and its children/data as a string
setElement(XMLstr, elementPath, newXMLstr [,cond1, cond2, cond3])	Replaces entier element(s) and its children/data with newXMLstr.
addElement(XMLstr, elementPath, newXMLstr, pos[,cond1,cond2,cond3]) Inserts newXMLstr in element at pos position (-1 to 9999).
delElement(XMLstr, elementPath [,cond1, cond2, cond3])				Removes entier element(s) and its children/data
sortElement(XMLstr, XMLpath)										Retrieves the XMLstr with the elements def by XMLpath sorted
sortElements(XMLstr, XMLpath)										Retrieves an array of sorted elements def by XMLpath
-------------------------------------------------------------------------------------*/

/*
comming functions:
getXML(XMLstr, XMLpath, [conditions])				Retrieves elementdata or attributedata from element spec by XMLpath in XMLstr.
setXML(XMLstr, XMLpath, content, [conditions])		Replaces or appends elementdata or attributedata in element spec by XMLpath in XMLstr.
addXML(XMLstr, XMLpath, content, [conditions])		appends elementdata or attributedata in element spec by XMLpath in XMLstr.
delXML(XMLstr, XMLpath, [conditions])				Remove element or attribute (with data)
*/

// -------------------------------- parser -----------------------------------------

function parseXMLAttribute(theXML, element, attribute){
	var value='';
	var startPos=theXML.indexOf('<' + element);
	if (startPos>-1){
		var pos = theXML.indexOf(attribute + '=', startPos);
		if (pos>-1 & pos<theXML.indexOf('>', startPos)){
			pos=pos+attribute.length+2;
			var endpos = theXML.indexOf('" ', pos);
			value=theXML.substring(pos, endpos);
		}
	}
	return value;
}


// -------------------------------------------- Element ----------------------------------------------------------


// ------------------------------ getElements -------------------------------------------------------------
// Hämtar alla element ur SourceXML som matchar pathen i ElementPath och villkoren i conditions
// och returnerar dem som en Array av strängar!
//
// SourceXML   : XML sträng som måste vara korrekt formaterad!! inga felmeddelanden returneras av funktionen.
//
// searchPath  : sökväg till elementet/attributet t ex
// "/PRODUCT_LIST/PRODUCTS/" = Returnerar alla PRODUCTS element från root under PRODUCT_LIST & HEAD
// "PRODUCTS/" 				 = Returnerar alla PRODUCTS element som finns i SourceXML.
// "PRODUCTS/artnr" 		 = Returnerar attributvärdet av artnr ur alla PRODUCTS element
//
// conditions1, condition2, condition3  : tre strängar med villkor som skall uppfyllas t ex, kan utelämnas
// ""					 	 = Alla element, inget urval görs
// "artnr"					 = Alla element som har attributet artnr
// "art*"					 = Alla element med något attribut som börjar på art
// "artnr="1010"			 = Alla element med attributet artnr och attributvärdet 1010
// "artnr="10*				 = Alla element med attributet artnr och attributvärdet som börjar på 10
// --------------------------------------------------------------------------------------------------------

function getElements(sourceXML, searchPath, condition1, condition2, condition3){
	var resultArray=[];
	var attribute='';
	var condition=[];
	var l='/';
	var tmpStr='';
	var i=0; 
	var pos=0;
	var count=0;

	function traverseXML(XMLpath, startPos, endPos, level){				// rekursiv funktion
		var startTagPos=sourceXML.indexOf('<', startPos);					// elementet
		var endElementPos=0;
		var endTagPos=0;
		var endNamePos=0;
		
		
		//document.write('(' + level + ') ['+ startPos + '-' + endPos + ']')
		
		while (startTagPos<endPos&&startTagPos>-1){
			endTagPos=sourceXML.indexOf('>', startTagPos);				// tagslut
			if (endTagPos<0){
				endTagPos=endPos;
			}
			i=sourceXML.indexOf('/>', startTagPos);
			if (i>0&&i<endTagPos){
				endTagPos=i;
			}else{
				i=endPos;
			}
			endNamePos=sourceXML.indexOf(' ', startTagPos);				// Elementnamn
			if (endNamePos>endTagPos||endNamePos<0){
				endNamePos=endTagPos;
			}
			
			endElementPos=sourceXML.indexOf('</'+sourceXML.substring(startTagPos+1, endNamePos)+'>', endTagPos);		// elementslut
			if (endElementPos<startPos||endElementPos>endPos||endElementPos>i){
				endElementPos=endTagPos;
			}
			tmpStr=XMLpath+sourceXML.substring(startTagPos+1, endNamePos)+l;	// Bygg sökväg
			//alert(startTagPos+'  ' + endNamePos);			
			//document.write(level + ': ' + tmpStr + ' <[' + startTagPos +'-' + endNamePos + '] - ' + endTagPos + '> ' + endElementPos + ')<BR>' );
			if ((tmpStr==searchPath)||											// Sökväg funnen
			    (l+searchPath==tmpStr.substring(tmpStr.length-searchPath.length-1))){			
  			 	count=0;														// attributvillkoren
				for (i=0; i<condition.length; i++){								
					 pos=sourceXML.indexOf(condition[i], startTagPos);

					 if (pos>0&&pos<endTagPos){
					 	count++;
					}
				}
				//alert(count + '  ' + i);
				if (count==i){													// Villkor uppfyllda				
					if (attribute!=''){												// Returnera attributvärden
						i=sourceXML.indexOf(attribute, endNamePos);
						while (i>-1&&i<endTagPos){
							i=sourceXML.indexOf('"', i)+1;
							resultArray[resultArray.length]=sourceXML.substring(i, sourceXML.indexOf('"', i));
							i=sourceXML.indexOf(attribute, i);
						}					
					}else{															// returnera elementet
						if (endElementPos!=endTagPos){
							i=(endNamePos-startTagPos)+2;
						}else{
							i=2;
						}
						//alert(sourceXML.substring(startTagPos, endElementPos+i));
						resultArray[resultArray.length]=sourceXML.substring(startTagPos, endElementPos+i);
					}
				}
			}
			
			if (endElementPos!=endTagPos){								// elementdata att rekursera?
				traverseXML(XMLpath+sourceXML.substring(startTagPos+1, endNamePos)+l, endTagPos+1, endElementPos, level+1);					// rekursera den
			}
			
						
			//alert(startTagPos + '   ' + endElementPos + '   ' + XMLpath + '    ' + sourceXML.substring(startTagPos+1, endNamePos));			
			startTagPos=sourceXML.indexOf('<', endElementPos+1);		// nästa syster elementet
		}
	}


	if (searchPath.charAt(searchPath.length-1)!='/'){					// Önskar attributvärde till svar
		var tmpArray=searchPath.split('/');
		attribute=tmpArray[tmpArray.length-1];
		searchPath=searchPath.substring(0, searchPath.length-attribute.length);
		if (attribute.charAt(attribute.length-1)=='*'){
			attribute=attribute.substring(0, attribute.length-1);
		}else{
			attribute+='="';
		}
		attribute=' ' + attribute;
	}

	if (condition1)	condition[0]=condition1;							// Attributvillkor
	if (condition2)	condition[1]=condition2;
	if (condition3)	condition[2]=condition3;
	
	if (condition.length>-1){											// preparera söksträngarna
		for (i=0; i<condition.length; i++){
			if (condition[i].charAt(condition[i].length-1)=='*'){
				condition[i]=condition[i].substring(0, condition[i].length-1);
			}else{
				if (condition[i].indexOf('=')==-1){
					condition[i]+='="';
				}
			}
			condition[i]=' ' + condition[i];
		}
	}
	
	if (typeof(sourceXML)=='string'){
		traverseXML('/', 0, sourceXML.length, 0);
	}
	return resultArray;
}

// tilläggsfunktion till ovan som returnerar en sträng
// istället för en Array av strängar om fler element
// stämmer med beskrivning.
function getElement(sourceXML, searchPath, condition1, condition2, condition3){ 		// Hämta alla element som EN sträng
	var aTmp=getElements(sourceXML, searchPath, condition1, condition2, condition3);
	var sReturn='';
	for (var i=0; i<aTmp.length; i++){
		sReturn+=aTmp[i];
	}
	return sReturn;
}


// -------------------------------------- setElement ----------------------------------------------------
// Replaces the element(s) specified in elementPath with the data in newXMLstr and returns the new XML string.
// 
// -----------------------------------------------------------------------------------------------------

function setElement(sourceXML, elementPath, newXMLstr, cond1, cond2, cond3){
	if (sourceXML.length>-1){
		var tmpElement=getElements(sourceXML, elementPath, cond1, cond2, cond3);
		var i=0;
		var pos=0;
		while (i<tmpElement.length){
			pos=sourceXML.indexOf(tmpElement[i]);
			if (pos>-1){
				sourceXML=sourceXML.substring(0, pos) + newXMLstr + sourceXML.substring(pos+tmpElement[i].length, sourceXML.length);
			}
			i++;
		}
	}
	return sourceXML;
}



// -------------------------------------- addElement ----------------------------------------------------
// adds newXMLstr as a sister element to elements matching the elementPath at position pos.
// is usefull when you wish to add a element to a list of elements, described in elementPath.
// if pos is omitted or pos is less then 1, the new element apears att the top off the list.
// if pos is greater then the number of element in list the new element apears att the bottom of the list.
// 
// -----------------------------------------------------------------------------------------------------
function addElement(XMLstr, elementPath, newXMLstr, pos, cond1, cond2, cond3){
	if (XMLstr.length>-1){
		if (pos){pos=pos;}else{pos=0;}
		var tmpElement=getElements(XMLstr, elementPath, cond1, cond2, cond3);
		//alert(tmpElement.length);
		if (tmpElement.length>0){
			if (pos>tmpElement.length-1){
				pos=tmpElement.length-1;
				//alert(pos);
				var insertPos=XMLstr.indexOf(tmpElement[pos]) + tmpElement[pos].length;
			}else{
				var insertPos=XMLstr.indexOf(tmpElement[pos]);
			}
			XMLstr=XMLstr.substring(0, insertPos) + newXMLstr + XMLstr.substring(insertPos, XMLstr.length);
			//alert(insertPos);
		}		
	}
	return XMLstr;
}


// -------------------------------------- delElement ----------------------------------------------------
// Removes the element(s) specified in elementPath wich matches the attribute conditions.
// 
// -----------------------------------------------------------------------------------------------------
function delElement(XMLstr, elementPath, cond1, cond2, cond3){
	if (XMLstr.length>0){
		var tmpElement=getElements(XMLstr, elementPath, cond1, cond2, cond3);
		var i=0;
		var pos;
		while (i<tmpElement.length){
			pos=XMLstr.indexOf(tmpElement[i]);
			if (pos>-1){
				XMLstr=XMLstr.substring(0, pos) + XMLstr.substring(pos+tmpElement[i].length, XMLstr.length);
			}
			i++;
		}
	}
	return XMLstr;
}


// -------------------------------------- sortElement(s) -----------------------------------------------
// returns the sorted elements specified with XMLpath in XMLstr by the attribute in XMLpath.
// sortElements - returns only the sorted elements in an array
// sortElement - returns the complete XMLstr with the sorted elements in it
// 
// XMLstr  - a valid XML string.
// XMLpath - a searchpath to the elements to be sorted and the attribute to sort from
// 			 "PRODUCTS/artnr" = sorts all PRODUCTS element by the elements attributevalue artnr.
// -----------------------------------------------------------------------------------------------------
function sortElements(XMLstr, XMLpath){
	var tmpArray=XMLpath.split('/');
	var	attribute=tmpArray[tmpArray.length-1];
	XMLpath=XMLpath.substring(0, XMLpath.length-attribute.length);
	var elements=getElements(XMLstr, XMLpath);
	if (elements.length>0){
		elements=_pm_array_qsort(elements, 0, elements.length-1, attribute);
	}
	return elements;
}
function sortElement(XMLstr, XMLpath){
	if (typeof(XMLstr)=='string'){
		var tmpStr=XMLpath.split('/');
		var	attribute=tmpStr[tmpStr.length-1];
		XMLpath=XMLpath.substring(0, XMLpath.length-attribute.length);
		var elements=getElements(XMLstr, XMLpath);
		if (elements.length>0){
			var startPos=XMLstr.indexOf(elements[0]);
			var endPos=startPos;
			elements=_pm_array_qsort(elements, 0, elements.length-1, attribute);
			tmpStr='';
			for (var i=0; i<elements.length; i++){
				endPos+=elements[i].length;
				tmpStr+=elements[i];
			}
			XMLstr=XMLstr.substring(0,startPos) + tmpStr + XMLstr.substring(endPos, XMLstr.length);
		}	
	}
	return XMLstr;
}





// -------------------------------------- XML ----------------------------------------------------



// -------------------------------------- getXML ----------------------------------------------------
// Retrieves the content (data and child elements) from the element specified by elementPath.
// 
// -----------------------------------------------------------------------------------------------------
function getXML(XMLstr, elementPath, cond1, cond2, cond3){
	var returnArray=[];
	var startPos=0;
	var endPos=0;
	var Name='';
	var tmpArray=getElements(XMLstr, elementPath, cond1, cond2, cond3);
	for (var i=0; i<tmpArray.length; i++){
		startPos=tmpArray[i].indexOf('>');
		endPos=tmpArray[i].indexOf('</' + elementName(tmpArray[i]) + '>');
		if (endPos<0){
			endPos=tmpArray[i].indexOf('/>', startPos);
		}
		if (endPos>-1){
			returnArray[returnArray.length]=tmpArray[i].substring(startPos+1, endPos);
		}
	}
	return returnArray;
}


// ------------------------------ parseXML -------------------------------------------------------------
// Hämtar alla attribut eller data ur SourceXML som matchar pathen i ElementPath och villkoren i conditions
// och returnerar dem som en Array av strängar!
//
// SourceXML   : XML sträng som måste vara korrekt formaterad!! inga felmeddelanden returneras av funktionen.
//
// searchPath  : sökväg till elementet/attributet t ex
// "/PRODUCT_LIST/PRODUCTS/" = Returnerar data från alla PRODUCTS element från root under PRODUCT_LIST & HEAD
// "PRODUCTS/" 				 = Returnerar data från alla PRODUCTS element som finns i SourceXML.
// "PRODUCTS/artnr" 		 = Returnerar attributvärdet av artnr ur alla PRODUCTS element
//
// conditions1, condition2, condition3  : tre strängar med villkor som skall uppfyllas t ex, kan utelämnas
// ""					 	 = Alla element, inget urval görs
// "artnr"					 = Alla element som har attributet artnr
// "art*"					 = Alla element med något attribut som börjar på art
// "artnr="1010"			 = Alla element med attributet artnr och attributvärdet 1010
// "artnr="10*				 = Alla element med attributet artnr och attributvärdet som börjar på 10
// --------------------------------------------------------------------------------------------------------

function parseXML(sourceXML, searchPath, condition1, condition2, condition3){
	if (searchPath.charAt(searchPath.length-1)!='/'){
		return getElements(sourceXML, searchPath, condition1, condition2, condition3);
	}else{
		var returnArray=[];
		var startPos=0;
		var tmpArray=getElements(sourceXML, searchPath, condition1, condition2, condition3);
		for (var i=0; i<tmpArray.length; i++){
			startPos=tmpArray[i].indexOf('>');
			endPos=tmpArray[i].indexOf('<', startPos);
			//alert(tmpArray + '  ' + startPos);
			if (endPos>-1){
				returnArray[returnArray.length]=tmpArray[i].substring(startPos+1, endPos);
			}
		}
		return returnArray;
	}
}	






// -------------------------------------- deleteXML ----------------------------------------------------
// Tar bort elementen som matchar searchPath och condition1..3 (med döttrar) ur sourceXML!
// se getElement för detaljerade information.
// -----------------------------------------------------------------------------------------------------
function deleteXML(sourceXML, searchPath, condition1, condition2, condition3){
	var returnXML=sourceXML;
	if (sourceXML.length){	
		var tmpElement=getElements(sourceXML, searchPath, condition1, condition2, condition3);
		var i=0;
		var pos;
		while (i<tmpElement.length){
			pos=returnXML.indexOf(tmpElement[i]);
			if (pos>0){
				returnXML=returnXML.substring(0, pos) + returnXML.substring(pos+tmpElement[i].length, returnXML.length);
			}
			i++;
		}
	}
	return returnXML;
}


// -------------------------------------- insertXML ----------------------------------------------
// Sätter in ett nytt element (elementData) i SourceXML på platsen specificerad av elementPath
// t ex:
// /HEAD/PRODUCT_LIST/PRODUCTS/		= lägger till elementet efter ev andra product element
// PRODUCTS/artnr="2030" 			= lägger till elementet efter produkten med artnr 2030
// -----------------------------------------------------------------------------------------------

function insertXML(sourceXML, searchPath, elementData, condition1, condition2, condition3){
	var returnXML=sourceXML;
	var tmpElement=getElements(sourceXML, searchPath, condition1, condition2, condition3);
	var i=0;
	var pos;
	if (tmpElement.length>0){
		pos=returnXML.indexOf(tmpElement[i])+tmpElement[i].length-1;
		while (pos>0 & returnXML.charAt(pos)!='<'){
			pos--;
		}
		if (pos>-1){
			returnXML=returnXML.substring(0, pos) + elementData + returnXML.substring(pos, returnXML.length);
		}
	}
	return returnXML;
}


// -------------------------------------- updateXML ----------------------------------------------
// Ersätter befintligt(a) element specificerat av elementPath i sourceXML med nytt element, elementData
// t ex:
// /HEAD/PRODUCT_LIST/PRODUCTS/		= Ersätter alla PRODUCTS element med elementData
// PRODUCTS/artnr="2030" 			= Ersätter elementet PRODUCTS som har artnr 2030
// -----------------------------------------------------------------------------------------------

function updateXML(sourceXML, searchPath, elementData, condition1, condition2, condition3){
	var returnXML=sourceXML;
	if (sourceXML.length){
		var tmpElement=getElements(sourceXML, searchPath, condition1, condition2, condition3);		
		var i=0;
		var pos=0;
		while (i<tmpElement.length){
			pos=returnXML.indexOf(tmpElement[i]);
			//alert(tmpElement[i]);
			if (pos>0){
				returnXML=returnXML.substring(0, pos) + elementData + returnXML.substring(pos+tmpElement[i].length, returnXML.length);
			}
			i++;
		}
	}
	return returnXML
}


// --------------------------------------------- Attributes ----------------------------------------------------------



// ------------------------------------- get Attribute --------------------------------------
// Hämtar attributdata från attributet beskrivet i elementPath ur sourceXML.
// elementPath anger sökvägen till önskat element, se getElement för syntax.
// attributeData är attributnamn och dess data ex: 'attr1="data1" attr2="data2"...'.
// ------------------------------------------------------------------------------------------
function getAttribute(sourceXML, searchPath, attributeData, condition1, condition2, condition3){
	if (searchPath.charAt(searchPath.length-1)=='/'){
		searchPath+='*';
	}
	return getElements(sourceXML, searchPath, attributeData, condition1, condition2, condition3);
}

// ------------------------------------- set Attribute --------------------------------------
// Ändrar/lägger till attributet(n) från attributeData i elementPath i sourceXML.
// elementPath anger sökvägen till önskat element, se getElement för syntax.
// attributeData är attributnamn och dess data ex: 'attr1="data1" attr2="data2"...'.
// ------------------------------------------------------------------------------------------

function setAttribute(sourceXML, searchPath, attributeData, condition1, condition2, condition3){
	var returnXML=sourceXML;
	var aCount=0;
	if (sourceXML.length){
		var newAttr=attributeData.split('"');			// Fixa till de nya attributen		
		newAttr.length=newAttr.length-1;
		for (aCount=0; aCount<newAttr.length; aCount=aCount+2){
			if (newAttr[aCount].charAt(0)!=' '){
				newAttr[aCount] = ' '+newAttr[aCount];
			}
			newAttr[aCount+1]='"' + newAttr[aCount+1] + '"';
		}		
		//alert(newAttr);
		var tmpElement=getElements(sourceXML, searchPath, condition1, condition2, condition3);
		var elementCount=0;
		var elementPos=0;
		var pos=0;
		var end=0;
		var attrStr='';
		var i=0;
		while (elementCount<tmpElement.length){									// alla element som passade
			var len=tmpElement[elementCount].length;			
			elementPos=returnXML.indexOf(tmpElement[elementCount]);
			pos=tmpElement[elementCount].indexOf('>')+1;
			tmpElement[elementCount]=tmpElement[elementCount].substring(0,pos);
			if (elementPos>-1){													// ersätt/lägg till attributen
				returnXML=returnXML.substring(0, elementPos) + returnXML.substring(elementPos+tmpElement[elementCount].length, returnXML.length);
				for (aCount=0; aCount<newAttr.length; aCount=aCount+2){			// Loopa alla attribut
					pos=tmpElement[elementCount].indexOf(newAttr[aCount]);
					if (pos>0){													// attributet finns, ta bort den
						end=tmpElement[elementCount].indexOf('"', pos+newAttr[aCount].length+1)+1;
						tmpElement[elementCount]=tmpElement[elementCount].substring(0, pos) + tmpElement[elementCount].substring(end, tmpElement[elementCount].length);
					}else{														// attributet fanns inte, hitta nytt ställe att lägga på						
						i=tmpElement[elementCount].indexOf('<');
						pos=tmpElement[elementCount].indexOf(' ', i);
						if (pos<0||pos>tmpElement[elementCount].indexOf('/>')){
							pos=tmpElement[elementCount].indexOf('/>');
							if (pos<0||pos>tmpElement[elementCount].indexOf('>')){
								pos=tmpElement[elementCount].indexOf('>');
							}
						}
					}
					if (pos>0){													// sätt in nya attributet
						attrStr=newAttr[aCount]+newAttr[aCount+1];
						tmpElement[elementCount]=tmpElement[elementCount].substring(0, pos) + attrStr + tmpElement[elementCount].substring(pos, tmpElement[elementCount].length);
					}
				}
				returnXML=returnXML.substring(0, elementPos) + tmpElement[elementCount] + returnXML.substring(elementPos, returnXML.length);
			}
			//alert(tmpElement[elementCount]);
			elementCount++;
		}
	}
	return returnXML;
}


// --------------------------------------------- Data ----------------------------------------------------------


// ------------------------------------- get Data -------------------------------------------
// Hämtar data ur sourceXML från elementet angivet med elementPath.
//
// SourceXML   : XML sträng som måste vara korrekt formaterad!! inga felmeddelanden returneras av funktionen.
//
// searchPath  : sökväg till elementet/attributet t ex
// "/PRODUCT_LIST/PRODUCTS/" = Returnerar data från alla PRODUCTS element från root under PRODUCT_LIST & HEAD
// "PRODUCTS/" 				 = Returnerar data från alla PRODUCTS element som finns i SourceXML.
//
// [conditions1, condition2, condition3]  : tre strängar med villkor som skall uppfyllas t ex, kan utelämnas
// ""					 	 = Alla element, inget urval görs
// "artnr"					 = Alla element som har attributet artnr
// "art*"					 = Alla element med något attribut som börjar på art
// "artnr="1010"			 = Alla element med attributet artnr och attributvärdet 1010
// "artnr="10*				 = Alla element med attributet artnr och attributvärdet som börjar på 10
// ------------------------------------------------------------------------------------------

function getData(sourceXML, searchPath, condition1, condition2, condition3){
	if (searchPath.charAt(searchPath.length-1)=='/'){
		var returnArray=[];
		var startPos=0;
		var tmpArray=getElements(sourceXML, searchPath, condition1, condition2, condition3);
		for (var i=0; i<tmpArray.length; i++){
			startPos=tmpArray[i].indexOf('>');
			endPos=tmpArray[i].indexOf('<', startPos);
			//alert(tmpArray + '  ' + startPos);
			if (endPos>-1){
				returnArray[returnArray.length]=tmpArray[i].substring(startPos+1, endPos);
			}
		}
		return returnArray;
	}	
}

// ------------------------------------- add Data -------------------------------------------
// lägger till data i elementet angivet med elementPath i sourceXML.
// elementPath anger sökvägen till önskat element, se getElement för syntax.
// Data är den sträng som skall infogas i elementets kropp.
// ------------------------------------------------------------------------------------------
function addData(sourceXML, searchPath, Data, condition1, condition2, condition3){
	var returnXML=sourceXML;
	var tmpElement=getElements(returnXML, searchPath, condition1, condition2, condition3);
	var elementPos=0;
	var elementLength=0;
	var i=0;
	var x=0;
	var elementCount=0;
	var endPos=0;
	var pos=0;
	var elementName='';
	for (elementCount=0; elementCount<tmpElement.length; elementCount++){				// loopa genom alla element som matchar sökvillkor
		elementPos=sourceXML.indexOf(tmpElement[elementCount]);
		elementLength=tmpElement[elementCount].length;
		pos=tmpElement[elementCount].indexOf('/>');										// finn tagslutet
		endPos=tmpElement[elementCount].indexOf('>')
		if (pos<endPos&&pos>0){															// Singelavslutat element
			endPos=pos-1;
			i=tmpElement[elementCount].indexOf('<')+1;
			x=tmpElement[elementCount].indexOf(' ',i);
			if (x<0||x>tmpElement[elementCount].indexOf('/>',i)){
				x=tmpElement[elementCount].indexOf('/>',i);
			}
			elementName=tmpElement[elementCount].substring(i, x);
			//alert(elementName);
			Data='>' + Data+'</' + elementName + '>';
			pos=pos+2;
			//alert(endPos);
		}else{											// Öppet element
			pos=tmpElement[elementCount].indexOf('<', endPos);
		}
		tmpElement[elementCount]=tmpElement[elementCount].substring(0, endPos+1) + Data + tmpElement[elementCount].substring(pos, tmpElement[elementCount].length);
		returnXML=returnXML.substring(0, elementPos) + tmpElement[elementCount] + returnXML.substring(elementPos+elementLength, returnXML.length);	
	}
	return returnXML;
}			


// ------------------------------------- set Data -------------------------------------------
// Ändrar data i elementet angivet med elementPath i sourceXML.
// elementPath anger sökvägen till önskat element, se getElement för syntax.
// Data är den sträng som skall infogas i elementets kropp.
// ------------------------------------------------------------------------------------------
function setData(sourceXML, searchPath, Data, condition1, condition2, condition3){
	var returnXML=sourceXML;
	var tmpElement=getElements(returnXML, searchPath, condition1, condition2, condition3);
	var elementPos=0;
	var elementLength=0;
	var elementCount=0;
	var endPos=0;
	var pos=0;
	var elName='';
	for (elementCount=0; elementCount<tmpElement.length; elementCount++){				// loopa genom alla element som matchar sökvillkor
		elementPos=sourceXML.indexOf(tmpElement[elementCount]);
		elementLength=tmpElement[elementCount].length;		
		elName=elementName(tmpElement[elementCount]);
		pos=tmpElement[elementCount].indexOf('/>');										// finn tagslutet
		endPos=tmpElement[elementCount].indexOf('>')
		if (pos<endPos&&pos>0){							// Singelavslutat element
			endPos=pos-1;
			Data='>' + Data+'</' + elName + '>';
			pos=pos+2;
		}else{											// Öppet element
			pos=tmpElement[elementCount].indexOf('</'+elName+'>', endPos);
		}
		tmpElement[elementCount]=tmpElement[elementCount].substring(0, endPos+1) + Data + tmpElement[elementCount].substring(pos, tmpElement[elementCount].length);
		returnXML=returnXML.substring(0, elementPos) + tmpElement[elementCount] + returnXML.substring(elementPos+elementLength, returnXML.length);	
	}
	return returnXML;
}			

// -------------------------------------- sub functions --------------------------------------------------


// returns the name of the first element in XMLstr
function elementName(XMLstr){
	var startPos=XMLstr.indexOf('<')+1;
	if (startPos>0){
		var endPos=XMLstr.indexOf('>');
		var i=XMLstr.indexOf('/>');
		if (i<endPos&&i>startPos){
			endPos=i;
		}
		var i=XMLstr.indexOf(' ');
		if (i<endPos&&i>startPos){
			endPos=XMLstr.indexOf(' ');
		}
		return XMLstr.substring(startPos, endPos);
	}else{
		return '';
	}
}
// returns the attribute value in elementStr
function attributeData(elementStr, attribute){
	var startPos=elementStr.indexOf('<')+1;
	var retStr='';
	if (startPos>0){
		var endPos=elementStr.indexOf('>');
		if (endPos<0)endPos=elementStr.length;
		startPos=elementStr.indexOf(attribute+'="', startPos, endPos);
		if (startPos>0){
			startPos=startPos+(attribute.length+2);
			endPos=elementStr.indexOf('"', startPos, endPos);
			retStr=elementStr.substring(startPos, endPos);
		}
	}
	return retStr;
}


// -------------------------------------- XML2HTML ----------------------------------------------------


// Formatera en sträng med indenter och radbyten 

function formatXML(XMLstr){
	var pos=XMLstr.indexOf('<');
	var i=0; ii=0;
	var indent=String.fromCharCode(13);
	while (pos>=0){
		XMLstr=XMLstr.substring(0,pos)+indent+XMLstr.substring(pos, XMLstr.length);
				
		i=XMLstr.indexOf('</', pos+indent.length+1);
		ii=XMLstr.indexOf('/>', pos+indent.length+1);
		if (ii>0 & ii<i){i=pos;}
		pos=XMLstr.indexOf('<', pos+indent.length+1);
		
		if (i<=pos){		//||(ii<pos))						// indentera		
			if (indent.length>1 & i==pos){
				indent=indent.substring(0, indent.length-2);
			}
		}else{
			indent+='  ';
		}		
	}
	return XMLstr;
}

// Tar bort formateringar (indenter och radbrytrningar)
function cleanXML(XMLstr){
	var pos=XMLstr.indexOf(String.fromCharCode(13));
	var end=0
	while (pos>=0){
		end=pos+1;
		while (XMLstr.charAt(end)==' '){
			end++;
		}
		XMLstr=(XMLstr.substring(0,pos)+XMLstr.substring(end+1, XMLstr.length));
		pos=XMLstr.indexOf(String.fromCharCode(13), pos);
	}
	return XMLstr;
}


function XML2HTML(XMLstr){
	var tmpStr = /</g
	return XMLstr.replace(tmpStr, "<br>&lt");
}
function showXML(target, XMLstr){
	target.document.write(XML2HTML(XMLstr));
}


function splitAttribute(str){
	var tmpArray=str.split('/');
	var tmpStr='';
	for (var i=0; i<tmpArray.length&&tmpArray.indexOf('"')<0; i++){
		tmpStr+=(tmpArray[i] + '/');
	}
	return tmpStr;
}
// ---------------------------------------- get --------------------------------------------------------
// från en sträng t ex "user=sven;..." returneras "sven" om argumentet är "user".
//

function get(argument, str){
	var retStr="";
	var endChr='"&;';
	var pos=str.indexOf(argument+'=');
	if (pos>=0){
		pos=pos + (argument.length) + 1;
		while (pos>0 & endChr.indexOf(str.charAt(pos))<0){
			retStr=retStr+str.charAt(pos);
			pos++
		}
		return retStr;
	}
}


// ----------------------------------------- sortXML ------------------------------------------------------
function _pm_array_qsort(vec,lo,up, attribute){
  var i, j, t;
  while(up > lo){
    i = lo;
    j = up;
    t = vec[lo];
    while(i < j){
      while(_cmpAttr(vec[j],t,attribute) > 0)
        j -= 1;
      vec[i] = vec[j];
      while((i < j) && (_cmpAttr(vec[i],t,attribute) <= 0))
        i++;
      vec[j] = vec[i];
    }
    vec[i] = t;
    if(i - lo < up - i){
     _pm_array_qsort(vec,lo,i-1,attribute); lo = i+1;
    } else {
     _pm_array_qsort(vec,i+1,up,attribute); up = i-1;
    }
  }
  return vec;
}
function _cmpAttr(a,b,attrPath){
	var aA=attributeData(a, attrPath);
	var aB=attributeData(b, attrPath);
	return (aA.toUpperCase(aA) == aB.toUpperCase(aB)) ? 0 : (aA.toUpperCase(aA) > aB.toUpperCase(aB)) ? 1 : -1;
}
