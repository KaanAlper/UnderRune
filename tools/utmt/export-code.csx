using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using UndertaleModLib.Decompiler;
EnsureDataLoaded();
var output=Environment.GetEnvironmentVariable("LL_EXPORT_DIR");
var pattern=Environment.GetEnvironmentVariable("LL_CODE_PATTERN");
if(String.IsNullOrWhiteSpace(output)||String.IsNullOrWhiteSpace(pattern))throw new Exception("Missing export options");
var folder=Path.Combine(output,"code");Directory.CreateDirectory(folder);
var context=new GlobalDecompileContext(Data);
var count=0;var failed=0;
foreach(var code in Data.Code.Where(x=>x.ParentEntry==null && Regex.IsMatch(x.Name.Content,pattern,RegexOptions.IgnoreCase))){
 try{
  var text=new Underanalyzer.Decompiler.DecompileContext(context,code,Data.ToolInfo.DecompilerSettings).DecompileToString();
  File.WriteAllText(Path.Combine(folder,code.Name.Content+".gml"),text);count++;
 }catch(Exception ex){Console.WriteLine("FAILED "+code.Name.Content+": "+ex.Message);failed++;}
}
Console.WriteLine("CODE: "+count+" exported, "+failed+" failed");
if(failed>0)throw new Exception("Some selected code could not be decompiled");
