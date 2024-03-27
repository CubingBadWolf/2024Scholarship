Dim objFSO, configFile, orgID, url, eAuthID, eAppID, data, JsonFile
set objFSO = CreateObject("Scripting.FileSystemObject")
set configFile = objFSO.OpenTextFile("config.txt", 1) '1 signifys For Reading only

Do Until configFile.AtEndOfLine
    Dim line
    line = configFile.ReadLine
    If InStr(line, "=") > 0 Then
        Dim parts
        parts = Split(line, "=")
        Select Case Trim(parts(0))
            Case "orgID"
                orgID = Trim(parts(1))
            Case "eAuthID"
                eAuthID = Trim(parts(1))
            Case "eAppID"
                eAppID = Trim(parts(1))
        End Select
    End If
Loop
configFile.Close

''' After writing this I tested by outputting a message box with data'''
''' And it worked correctly. '''

If orgID = "" Or eAuthID = "" Or eAppID = "" Then
    WScript.Echo "Error: Configuration values missing from config.txt"
    WScript.Quit
End If
'''Safety code if something goes wrong - To change to web error when porting'''

url = "https://edgeapi.edgelearning.co.nz/api/v1/school/groups/2024"

data = GetURLTextContents(url, orgID, eAuthID, eAppID)
'''Data is outputted!, functioning. ''' 



' Function to get URL contents
Function GetURLTextContents(strURLtoGet, strSchoolNum, strEdgeBearerToken, strEdgeAppID)
    Dim objHTTP
    Set objHTTP = CreateObject("WinHttp.WinHttpRequest.5.1")


    objHTTP.Open "GET", strURLtoGet, False
    objHTTP.SetRequestHeader "Authorization", strEdgeBearerToken
    objHTTP.SetRequestHeader "appID", strEdgeAppID
    objHTTP.SetRequestHeader "SchoolNo", strSchoolNum
    objHTTP.Send()

    GetURLTextContents = objHTTP.responseText
    Set objHTTP = Nothing

End Function