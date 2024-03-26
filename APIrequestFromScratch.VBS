Dim objFSO, configFile, orgID, url, eAuthID, eAppID, sJasonFile
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
configFile.Close()

''' After writing this I tested by outputting a message box with data'''
''' And it worked correctly. '''

