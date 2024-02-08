﻿param($installPath, $toolsPath, $package, $project)

$analyzersDir = Join-Path (Split-Path -Path $toolsPath -Parent) "analyzers"
if (-Not (Test-Path $analyzersDir))
{
    return
}

$analyzersPaths = Join-Path ( $analyzersDir ) * -Resolve

foreach($analyzersPath in $analyzersPaths)
{
    # Uninstall the language agnostic analyzers.
    if (Test-Path $analyzersPath)
    {
        foreach ($analyzerFilePath in Get-ChildItem $analyzersPath -Filter *.dll)
        {
            if($project.Object.AnalyzerReferences)
            {
                $project.Object.AnalyzerReferences.Remove($analyzerFilePath.FullName)
            }
        }
    }
}

# $project.Type gives the language name like (C# or VB.NET)
$languageFolder = ""
if($project.Type -eq "C#")
{
    $languageFolder = "cs"
}
if($project.Type -eq "VB.NET")
{
    $languageFolder = "vb"
}
if($languageFolder -eq "")
{
    return
}

foreach($analyzersPath in $analyzersPaths)
{
    # Uninstall language specific analyzers.
    $languageAnalyzersPath = join-path $analyzersPath $languageFolder
    if (Test-Path $languageAnalyzersPath)
    {
        foreach ($analyzerFilePath in Get-ChildItem $languageAnalyzersPath -Filter *.dll)
        {
            if($project.Object.AnalyzerReferences)
            {
                try
                {
                    $project.Object.AnalyzerReferences.Remove($analyzerFilePath.FullName)
                }
                catch
                {

                }
            }
        }
    }
}
# SIG # Begin signature block
# MIIowAYJKoZIhvcNAQcCoIIosTCCKK0CAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCB5mT/HBF+ApGFF
# NurlQsK+/gKFs6a98ziX+/GaLDsVJqCCDfQwggZyMIIEWqADAgECAhMzAAADe6EK
# Pstm6QHAAAAAAAN7MA0GCSqGSIb3DQEBDAUAMH4xCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25p
# bmcgUENBIDIwMTEwHhcNMjMwNTExMTkwMzMwWhcNMjQwNTA4MTkwMzMwWjBjMQsw
# CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
# ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMQ0wCwYDVQQDEwQuTkVU
# MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAk6m4VW/Blfx6zoggenXD
# MqJMHpb9s2WECDZHHI5eZrLDjUTbc25qE4+sUxKMEVUs8vlB9SMDYv8iJ/R20YDl
# Ni9lGxHeaWfq2CpmcIPwQILNQoh1BgUnM7ljaSg0tIsO9I8CJHzGxT+dd8ilOEU6
# IwN9eesaZuIV8RGd/r3W3aDLaMH85rC7qxLkrKrNuCHHyme4dps0CMfHGzHHONwU
# v/a44HIK0VBsZ5UqcQNOPK6ifixhpsm7wELqWSYCKbq2M3uFznxkcr1Lf7cJ5HFU
# bHG2zNtaTy6P/hM2H3BLwKjLzbiUIu/samUEMsU3UPz8AMJLAF9AZ+CyHTYHAgHU
# Gtr7umURcXMB7JxgvhCIyXIQRabEEw7lgiEmIsgUkELuznzSQ7whi2T53nIBQ8u1
# IgLZIePt3LPPh08Jj1VLYfr0K9eLhbQpfqkuWSF0csRCj8ByGX2NXGnb2LaBHdUx
# mCRMhLapgWl2h/p/iOu0xds4f1e735wQCcESHF06oixzAgMBAAGjggGCMIIBfjAf
# BgNVHSUEGDAWBgorBgEEAYI3TAgBBggrBgEFBQcDAzAdBgNVHQ4EFgQUvsVyA0Jk
# bawa4kDP3YEP+hL3wLgwVAYDVR0RBE0wS6RJMEcxLTArBgNVBAsTJE1pY3Jvc29m
# dCBJcmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEWMBQGA1UEBRMNNDY0MjIzKzUw
# MTAzMzAfBgNVHSMEGDAWgBRIbmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBL
# MEmgR6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9NaWND
# b2RTaWdQQ0EyMDExXzIwMTEtMDctMDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggr
# BgEFBQcwAoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
# aWNDb2RTaWdQQ0EyMDExXzIwMTEtMDctMDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJ
# KoZIhvcNAQEMBQADggIBAH5lunnFFag8IUDGl+Z5WBW5jF4cEBM6S3fp/txC+/Jf
# 92UI5Om1LuAmq9ao/Ja5lI2r2DBJasccX8GeOiFOJraUumFwVE2Z5ejxMdLz4WXo
# XPKNFNz4FY2B1578zMphW/xucAyhET8OXkV2POUkK2rQj/bOUouO4FtNv0Gwx2UF
# oso3Or3BlAY6RfF9x63S3EMfEV+G0omvoY8gCXsGiSEl5MG2ysaJwxeVgMAI0d83
# PuMduAMdu5Jt/anb1au5cKsi+Db3MOuPYKcYl9NYuFjjwZmHWHzw54KS5/HhhRtr
# YVJRX5A+g+1g4KuYIUv2WaC8iF2zWgCJvEwMj9jAtX3/8l31UguBO9Zl+/bY/K5e
# cgz+Q0QdUTEqPtQGrHcmYfCH8A55SJrWKFaQkQ/b8n0k2GefYDZ67sUXNiEBBguF
# DTUVqMZ2LGTtOpWWkDw5+bW34/ByKVucz1kRs/nL8c3Uu7flI6EMI/H2fKEFxB1r
# QIHQ7ySAWrRT+rsUEgbA0bv+AnnflshoAZL8DpFQwF4eoGowFCSSGsU/HdWx+rvl
# asfMKcywpwDu0blnJXmV3pJsnZ101S+JqPDeVxHkYvoQJ1AHyMOow0TV4k6ZD2TK
# fOcsQZsIdGUzs+7mt/tBefWHUZaYhgzLlYxwfXfbcWHVFp6CoBF3JAuF2ITmReTq
# MIIHejCCBWKgAwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCBiDELMAkG
# A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
# HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
# b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTEwHhcNMTEwNzA4MjA1
# OTA5WhcNMjYwNzA4MjEwOTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
# aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
# cnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAy
# MDExMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAq/D6chAcLq3YbqqC
# EE00uvK2WCGfQhsqa+laUKq4BjgaBEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC
# 04kNeWSHfpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpgGgXpZnboMlIm
# Ei/nqwhQz7NEt13YxC4Ddato88tt8zpcoRb0RrrgOGSsbmQ1eKagYw8t00CT+OPe
# Bw3VXHmlSSnnDb6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD2Xuye4Yb
# 2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLTswM9sbKvkjh+0p2ALPVOVpEhNSXD
# OW5kf1O6nA+tGSOEy/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2z3yx
# kq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8kA/DRelsv1SPjcF0PUUZ3s/gA
# 4bysAoJf28AVs70b1FVL5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
# jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyimp31ngOaKYnhfsi+E11ec
# XL93KCjx7W3DKI8sj0A3T8HhhUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4Ta
# sIgX3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAGCSsGAQQBgjcVAQQD
# AgEAMB0GA1UdDgQWBBRIbmTlUAXTgqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIE
# DB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNV
# HSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx0SOJNDBaBgNVHR8EUzBRME+gTaBLhklo
# dHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29D
# ZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4GCCsGAQUFBwEBBFIwUDBOBggrBgEF
# BQcwAoZCaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29D
# ZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNVHSAEgZcwgZQwgZEGCSsGAQQB
# gjcuAzCBgzA/BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
# aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUFBwICMDQeMiAdAEwAZQBn
# AGEAbABfAHAAbwBsAGkAYwB5AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqG
# SIb3DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOSmUKWfdJ5DJDBZV8u
# LD74w3LRbYP+vj/oCso7v0epo/Np22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxC
# i1LQsP1r4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION9MsmAkYqwooQ
# u6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWluWpiW5IP0wI/zRive/DvQvTXvbiWu5a8n
# 7dDd8w6vmSiXmE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ2xWIUUVY
# ODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNABQamASooPoI/E01mC8CzTfXhj38c
# bxV9Rad25UAqZaPDXVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yHPgZ3
# BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ahXJbYANahRr1Z85elCUtIEJmA
# H9AAKcWxm6U/RXceNcbSoqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
# GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E90Z1WTk+/gFcioXgRMiF6
# 70EKsT/7qMykXcGhiJtXcVZOSEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGC
# GiIwghoeAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
# MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
# b24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENBIDIwMTECEzMA
# AAN7oQo+y2bpAcAAAAAAA3swDQYJYIZIAWUDBAIBBQCgga4wGQYJKoZIhvcNAQkD
# MQwGCisGAQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcCARUwLwYJ
# KoZIhvcNAQkEMSIEILtEeMEUesXcycnvAB00C1m+1XkEcUBjfhNIN2IZgfkZMEIG
# CisGAQQBgjcCAQwxNDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRwOi8v
# d3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEBBQAEggGAjuE2wk/g0uJN2bAy
# 6d547qfJ5eO2heFr4IOLDE3fcB5+JLpQU1BCTywL3aZ7oqpso3WwqpQ3hzsb/ssX
# dNzrHIz+LvDYNt5trbctRQh7NxBTh4cudf50IoHU9naP+jNCGYKQ6Krqxh8+GfXW
# FNVJ7iQWtjNqJJGaVeLY1iX1rXo3u+D32ZIRbr4KCFBWY9MvxnIEaxwAEtsWGPwv
# sedV6IPdC+Gh7N5EDu4PDytbe8GHHPhJeXOejWVnZIJZCRf3+ifOgNDRP1goz/jJ
# eKpGpQxeaoBEsO2Q+d7s86+wBdSr12ttdM9//qvglzxFn+imZJMo67HDqVj0Ni8y
# cyH+ldxwom0CY2lsnBJCV/cIuzO7rm6XNVSgqqDkMYgooHHkRTfOmGFUaaecxzX3
# OW5JplQVEjg7bGsBVObqDGyY3mxlMVHn5v/fxP4ftr4Ghxg0BWCwmIbOob9WJm/s
# Sm6OLKtwfCGwQW5cdeDkN5eIVYk1Y+3WewqvPWdrz37cjNRAoYIXLDCCFygGCisG
# AQQBgjcDAwExghcYMIIXFAYJKoZIhvcNAQcCoIIXBTCCFwECAQMxDzANBglghkgB
# ZQMEAgEFADCCAVkGCyqGSIb3DQEJEAEEoIIBSASCAUQwggFAAgEBBgorBgEEAYRZ
# CgMBMDEwDQYJYIZIAWUDBAIBBQAEIOLqgkCQo/ZGedwWMmh6z9IbagqNI14w7ugL
# vs+IcoKqAgZk3mZJDy8YEzIwMjMwODIwMTM0NDQyLjc5MlowBIACAfSggdikgdUw
# gdIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
# ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
# JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
# VGhhbGVzIFRTUyBFU046M0JENC00QjgwLTY5QzMxJTAjBgNVBAMTHE1pY3Jvc29m
# dCBUaW1lLVN0YW1wIFNlcnZpY2WgghF7MIIHJzCCBQ+gAwIBAgITMwAAAbT7gAhE
# BdIt+gABAAABtDANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UE
# CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
# b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
# Q0EgMjAxMDAeFw0yMjA5MjAyMDIyMDlaFw0yMzEyMTQyMDIyMDlaMIHSMQswCQYD
# VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
# MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3Nv
# ZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBU
# U1MgRVNOOjNCRDQtNEI4MC02OUMzMSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1T
# dGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtEem
# nmUHMkIfvOiu27K86ZbwWhksGwV72Dl1uGdqr2pKm+mfzoT+Yngkq9aLEf+XDtAD
# yA+2KIZU0iO8WG79eJjzz29flZpBKbKg8xl2P3O9drleuQw3TnNfNN4+QIgjMXpE
# 3txPF7M7IRLKZMiOt3FfkFWVmiXJAA7E3OIwJgphg09th3Tvzp8MT8+HOtG3bdrR
# d/y2u8VrQsQTLZiVwTZ6qDYKNT8PQZl7xFrSSO3QzXa91LipZnYOl3siGJDCee1B
# a7X1i13dQFHxKl5Ff4JzDduOBZ85e2VrpyFy1a3ayGUzBrIw59jhMbjIw9YVcQt9
# kUWntyCmNk15WybCS+hXpEDDLVj1X5W9snmoW1qu03+unprQjWQaVuO7BfcvQdNV
# dyKSqAeKy1eT2Hcc5n1aAVeXFm6sbVJmZzPQEQR3Jr7W8YcTjkqC5hT2qrYuIcYG
# Of3Pj4OqdXm1Qqhuwtskxviv7yy3Z+PxJpxKx+2e6zGRaoQmIlLfg/a42XNVHTf6
# Wzr5k7Q1w7v0uA/sFsgyKmI7HzKHX08xDDSmJooXA5btD6B0lx/Lqs6Qb4KthnA7
# N2IEdJ5sjMIhyHZwBr7fzDskU/+Sgp2UnfqrN1Vda/gb+pmlbJwi8MphvElYzjT7
# PZK2Dm4eorcjx7T2QVe3EIelLuGbxzybblZoRTkCAwEAAaOCAUkwggFFMB0GA1Ud
# DgQWBBTLRIXl8ZS4Opy7Eii3Tt44zDLZfjAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
# 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jvc29m
# dC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIw
# MjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8v
# d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
# U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB
# /wQMMAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOC
# AgEAEtEPBYwpt4JioSq0joGzwqYX6SoNH7YbqpgArdlnrdt6u3ukKREluKEVqS2X
# ajXxx0UkXGc4Xi9dp2bSxpuyQnTkq+IQwkg7p1dKrwAa2vdmaNzz3mrSaeUEu40y
# CThHwquQkweoG4eqRRZe19OtVSmDDNC3ZQ6Ig0qz79vivXgy5dFWk4npxA5LxSGR
# 4wBaXaIuVhoEa06vd/9/2YsQ99bCiR7SxJRt1XrQ5kJGHUi0Fhgz158qvXgfmq7q
# NqfqfTSmsQRrtbe4Zv/X+qPo/l6ae+SrLkcjRfr0ONV0vFVuNKx6Cb90D5LgNpc9
# x8V/qIHEr+JXbWXW6mARVVqNQCmXlVHjTBjhcXwSmadR1OotcN/sKp2EOM9JPYr8
# 6O9Y/JAZC9zug9qljKTroZTfYA7LIdcmPr69u1FSD/6ivL6HRHZd/k2EL7FtZwzN
# cRRdFF/VgpkOxHIfqvjXambwoMoT+vtGTtqgoruhhSk0bM1F/pBpi/nPZtVNLGTN
# aK8Wt6kscbC9G6f09gz/wBBJOBmvTLPOOT/3taCGSoJoDABWnK+De5pie4KX8Bxx
# KQbJvxz7vRsVJ5R6mGx+Bvav5AjsxvZZw6eQmkI0vPRckxL9TCVCfWS0uyIKmyo6
# TdosnbBO/osre7r0jS9AH8spEqVlhFcpQNfOg/CvdS2xNVMwggdxMIIFWaADAgEC
# AhMzAAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQG
# EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
# A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQg
# Um9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAxODIyMjVa
# Fw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
# dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
# YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIIC
# IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7V
# gtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeF
# RiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3X
# D9gmU3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoP
# z130/o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi947SHJMPgyY9+
# tVSP3PoFVZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJiss254o2I5Jas
# AUq7vnGpF1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/NmeRd+2ci/b
# fV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afomXw/TNuv
# XsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy16cg
# 8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y1BzF
# a/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqP
# nhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEw
# IwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSf
# pxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBB
# MD8GCCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0Rv
# Y3MvUmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGC
# NxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8w
# HwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBLoEmg
# R4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWlj
# Um9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEF
# BQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29D
# ZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEs
# H2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHk
# wo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinL
# btg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCg
# vxm2EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsId
# w2FzLixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2
# zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23K
# jgm9swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pFEUep8beu
# yOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L+DvktxW/
# tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1ZyvgDbjm
# jJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/2XBj
# U02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIC1zCCAkACAQEwggEAoYHYpIHVMIHS
# MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
# bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRN
# aWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRo
# YWxlcyBUU1MgRVNOOjNCRDQtNEI4MC02OUMzMSUwIwYDVQQDExxNaWNyb3NvZnQg
# VGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQBlnNiQ85uX9nN4KRJt
# /gHkJx4JCKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
# dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
# YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0G
# CSqGSIb3DQEBBQUAAgUA6IwwejAiGA8yMDIzMDgyMDE0MjYwMloYDzIwMjMwODIx
# MTQyNjAyWjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDojDB6AgEAMAoCAQACAgKJ
# AgH/MAcCAQACAhFpMAoCBQDojYH6AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisG
# AQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcNAQEFBQAD
# gYEAYXR5RogpNNIajaOb0Uhq+58bZ5LymJfWVychQgQK8Ap4uXGIDIs7sEyIvH3s
# kupD0WK8zWG7bq0YTiZYGnPlDaAM9dvLKbpuYLIgEuuOdzO1Qf2FbZ4f03hP9pS2
# i/H+jdvme1zpZWcKfNMgm/RMGBLjzxSQibBrPQU8sw5An4ExggQNMIIECQIBATCB
# kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
# UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
# Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAbT7gAhEBdIt+gAB
# AAABtDANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJ
# EAEEMC8GCSqGSIb3DQEJBDEiBCDB7G+8QlHJ7V0wfPUkFEbISG0PzEQsp7Fyh8wO
# lk32yTCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EINPI93vmozBwBlFxvfr/
# rElreFPR4ux7vXKx2ni3AfcGMIGYMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
# BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
# c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
# UENBIDIwMTACEzMAAAG0+4AIRAXSLfoAAQAAAbQwIgQg9xF7D/FYr7ca8PmVywq0
# YpZsxHcWw+ylZ6a0utFDs9QwDQYJKoZIhvcNAQELBQAEggIAZGkzTtUSD26B6TK8
# mfPxEoBf2K6zPeKs/XBdZohTO++gac+L6sIwSCLbZDpY6hxkCnrPjV8TR5JJi97a
# 5R40zzN6jxnkJoffKS2B77s0A4OmGcwx1wYO0TGT4NU5vhQPmG7VjF786fQTDwpy
# Ur9NmApuvKm2nsyvIEbhAmCwFDAyAf39YJVxhR8CZon2reQ4uNadxj6bV0eF34KH
# ZeuRgPy9XCiL12gPBu7HHkL5NTC68PwSCGu/pfUMkEvSPpB4jcNWQjCrGnHRScrl
# Svn7zT8QouqTtGJA0rXjBvhPeIyRD0pv1gCrNWAJSj4CODlFHR/BTSh5dVWaAO6i
# POIn7pKIgQHcyHmPq2ATgjScahgv5yHTF/R/bM5E027j1GswPraA/IIaf20aAI8R
# 3Ivt5R/E9Rb0ejL5+93eoaO0OVvGxOrPseRom/HFTbZUIuO2DfoE+6Q7KP9z4Uj9
# QpDw4CBMCS/jJbGvcauWjkBcsdMslMXf3XGb9De4c5hffKABs8xNnA+hlb+rjgq6
# btKAOpkK4ujiJb5RFTGmO9asjxgysP/YrxyPFvhpzaVvMSIVhSoIP15BpDWSaE34
# mIk+urz36UM+Aum1jIkXOAmmmkssYHCvDZCAxyFUAUGlr1nm5T53CvJ3PHF6s3NE
# 0y2HflsFmIth4StcK7MrS5LQvDU=
# SIG # End signature block
