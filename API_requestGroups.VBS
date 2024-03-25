'strURL = "https://edgeapi.edgelearning.co.nz/api/v1/school/groups/2024/"   'Make Year not hardcoded.'
strURL = "https://edgeapi.edgelearning.co.nz/api/V2/school/staff/" & right(date(),4)
Dim objFSO2, objFile2
Set objFSO2 = CreateObject("Scripting.FileSystemObject")

' Path to the configuration file
Dim configFilePath
configFilePath = "C:\Users\charlie.bauchop\Documents\Scholarship Project\2024Scholarship\config.txt" ' Update this with the actual path

' Check if the configuration file exists
If objFSO2.FileExists(configFilePath) Then
    ' Open the configuration file for reading
    Set objFile2 = objFSO2.OpenTextFile(configFilePath)

    ' Read the content of the configuration file
    Dim configContent
    configContent = objFile2.ReadAll()

    ' Close the file
    objFile2.Close()

    ' Parse the configuration content to extract the variables
    Dim lines, line, keyValue
    lines = Split(configContent, vbCrLf) ' Split content into lines

    Dim strEappID, strEAuthID, strOrgID
    For Each line In lines
        If InStr(line, "=") > 0 Then
            keyValue = Split(line, "=")
            Select Case keyValue(0)
                Case "strEappID"
                    strEappID = keyValue(1)
                Case "strEAuthID"
                    strEAuthID = keyValue(1)
                Case "strOrgID"
                    strOrgID = keyValue(1)
            End Select
        End If
    Next
    
    ' Now you can use these variables in your script
Else
    MsgBox "Configuration file not found!"
End If

Set objFSO2 = Nothing
'=============================================
'===    Reading Keys from config file     ====
'=============================================

'=============================================
'===    End of specific school changes    ====
'=============================================
strData = GetURLTextContents(strURL, strOrgID, strEAuthID, strEappID)

Const fsoForAppend = 8
Const fsoForWriting = 2

Dim objFSO
Set objFSO = CreateObject("Scripting.FileSystemObject")

Dim sJsonFile
sJsonFile = "C://users/charlie.bauchop/Documents/Scholarship Project/2024Scholarship/test.json"
Const OVER_WRITE_FILE = True

'Backup existing json file with current weekday as file extension
dtmToday = Date()
dtmDayOfWeek = DatePart("w", dtmToday)
Select Case dtmDayOfWeek
    Case 1 dtmDayOfWeek = "Sun"
    Case 2 dtmDayOfWeek = "Mon"
    Case 3 dtmDayOfWeek = "Tue"
    Case 4 dtmDayOfWeek = "Wed"
    Case 5 dtmDayOfWeek = "Thu"
    Case 6 dtmDayOfWeek = "Fri"
    Case 7 dtmDayOfWeek = "Sat"
    Case Else dtmDayOfWeek = "unknown"
End Select
If objFSO.FileExists(sJsonFile) Then
    objFSO.CopyFile sJsonFile, sJsonFile & "." & dtmDayOfWeek, OVER_WRITE_FILE
End if


Set objTextFile = objFSO.CreateTextFile(sJsonFile)
objTextFile.Close


Dim objBAT
Set objBAT = CreateObject("Scripting.FileSystemObject")
Set objBATFile = objBAT.OpenTextFile(sJsonFile, fsoForAppend, True)

strData = left(strData,len(strData)-1)
strData = right(strData,len(strData)-1)

objBATFile.WriteLine "["

bolEndOfJSONFile = false

do Until bolEndOfJSONFile = true

  if len(strData)<5 then
   
    bolEndOfJSONFile = true
 
  else
     
    strJSONRecord = left(strData, instr(strData,"}"))
    strJSONRecord = right(strJSONRecord,len(strJSONRecord)-2)
    strData = right(strData,len(strdata)-instr(strdata,"}"))
   
    bolEoJSONRecord = false
   
    objBATFile.WriteLine "{"
   
    do until bolEoJSONRecord = true
   
        if instr(strJSONRecord,"," & chr(34))>0 then
       
            strJSONField = left(strJSONRecord,instr(strJSONRecord,"," & chr(34))-1)
            strJSONRecord = right(strJSONRecord,len(strJSONRecord)-instr(strJSONRecord,"," & chr(34))-1)
            if left(strJSONField,1)<>chr(34) then strJSONField = chr(34) & strJSONField
            objBATFile.WriteLine strJSONField & ","
       
        else
       
            strJSONField = left(strJSONRecord,len(strJSONRecord)-1)
            objBATFile.WriteLine chr(34) & strJSONField
           
            if len(strData)>5 then
                objBATFile.WriteLine "},"  
            else
                objBATFile.WriteLine "}"
            end if
           
            bolEoJSONRecord = true
       
        end if
               
    Loop
       
  end if

Loop

objBATFile.WriteLine "]"

objBATFile.Close
Set objBATFile = Nothing


'======================================================================================================
'=== End of Script - functions below                                                                ===
'======================================================================================================


Function GetURLTextContents(strURLtoGet,strSchoolNum,strEdgeBearerToken,strEdgeAppID)
MsgBox(strSchoolNum)
Dim objHTTP
Set objHTTP = CreateObject("WinHttp.WinHttpRequest.5.1")

objHTTP.Open "GET", strURLtoGet, False
objHTTP.SetRequestHeader "Authorization", strEdgeBearerToken
objHTTP.SetRequestHeader "appID", strEdgeAppID
objHTTP.SetRequestHeader "SchoolNo", strSchoolNum
objHTTP.Send()
MsgBox(objHTTP.responseText)
GetURLTextContents = objHTTP.responseText
Set objHTTP = Nothing

End Function