using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Security.Cryptography;
using Newtonsoft.Json;
using UndertaleModLib.Decompiler;
EnsureDataLoaded();
var output=Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
var pattern=Environment.GetEnvironmentVariable("LL_CODE_PATTERN");
if(String.IsNullOrWhiteSpace(output)||String.IsNullOrWhiteSpace(pattern))throw new Exception("Missing export options");
var folder=Path.Combine(output,"code");Directory.CreateDirectory(folder);
var context=new GlobalDecompileContext(Data);
var count=0;var failed=0;
var records=new List<object>();
foreach(var code in Data.Code.Where(x=>x.ParentEntry==null && Regex.IsMatch(x.Name.Content,pattern,RegexOptions.IgnoreCase))){
 try{
  if(code.Name.Content.IndexOfAny(Path.GetInvalidFileNameChars())>=0)throw new Exception("Unsafe code name");
  var text=new Underanalyzer.Decompiler.DecompileContext(context,code,Data.ToolInfo.DecompilerSettings).DecompileToString();
  File.WriteAllText(Path.Combine(folder,code.Name.Content+".gml"),text);count++;
  using(var sha=SHA256.Create()){
   var digest=BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant();
   records.Add(new {name=code.Name.Content,status="decoded",sha256=digest});
  }
  if(count%250==0)Console.WriteLine("PROGRESS: "+count+" decoded");
 }catch(Exception ex){Console.WriteLine("FAILED "+code.Name.Content+": "+ex.Message);records.Add(new {name=code.Name.Content,status="failed",error=ex.Message});failed++;}
}
File.WriteAllText(Path.Combine(output,pattern=="."?"full-code-manifest.json":"selected-code-manifest.json"),JsonConvert.SerializeObject(new {pattern,decoded=count,failed,records},Formatting.Indented));
Console.WriteLine("CODE: "+count+" exported, "+failed+" failed");
if(failed>0)throw new Exception("Some selected code could not be decompiled");
