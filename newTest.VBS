Dim strURL, objFSO, objFile, configFilePath
Dim strEappID, strEAuthID, strOrgID, strData

' Define the URL
strURL = "https://edgeapi.edgelearning.co.nz/api/V2/school/staff/" & Right(Date(), 4)

' Create FileSystemObject
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Path to the configuration file
configFilePath = "C:\Users\charlie.bauchop\Documents\Scholarship Project\2024Scholarship\config.txt"

' Check if the configuration file exists
If objFSO.FileExists(configFilePath) Then
    ' Open the configuration file for reading
    Set objFile = objFSO.OpenTextFile(configFilePath)

    ' Read the content of the configuration file
    Dim configContent, lines, line, keyValue
    configContent = objFile.ReadAll()

    ' Close the file
    objFile.Close()

    ' Parse the configuration content to extract the variables
    lines = Split(configContent, vbCrLf) ' Split content into lines

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

' Fetch data from URL using provided credentials
strData = GetURLTextContents(strURL, strOrgID, strEAuthID, strEappID)

' Path to the JSON file
Dim sJsonFile
sJsonFile = "C:\Users\charlie.bauchop\Documents\Scholarship Project\2024Scholarship\test.json"

' Backup existing json file with current weekday as file extension
Dim dtmToday, dtmDayOfWeek
dtmToday = Date()
dtmDayOfWeek = WeekdayName(Weekday(dtmToday), True)
If objFSO.FileExists(sJsonFile) Then
    objFSO.CopyFile sJsonFile, sJsonFile & "." & dtmDayOfWeek, True ' Overwrite existing backup
End If

' Write data to JSON file
Dim objTextFile
Set objTextFile = objFSO.CreateTextFile(sJsonFile, True)
objTextFile.WriteLine strData
objTextFile.Close

' Function to fetch URL content




Function GetURLTextContents(strURLtoGet,strSchoolNum,strEdgeBearerToken,strEdgeAppID)

Dim objHTTP
Set objHTTP = CreateObject("WinHttp.WinHttpRequest.5.1")
MsgBox(strEdgeBearerToken + strEdgeAppID + strSchoolNum)

objHTTP.Open "GET", strURLtoGet, False
objHTTP.SetRequestHeader "Authorization", strEdgeBearerToken
objHTTP.SetRequestHeader "appID", strEdgeAppID
objHTTP.SetRequestHeader "SchoolNo", strSchoolNum
objHTTP.Send()

GetURLTextContents = objHTTP.responseText

Set objHTTP = Nothing

End Function

