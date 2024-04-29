using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using Dapper;


namespace Kiosk.Models
{
    public class DataRepository
    {
        private IDbConnection _db = new SqlConnection(ConfigurationManager.ConnectionStrings["KioskDatabase"].ConnectionString);

        public List<Language> getLanguages()
        {
            var a = @"Select Language_CD as language_CD,
                                Language as language
                        From dbo.Languages";
            var languages = this._db.Query<Language>(a).ToList();
            return languages;

        }
        public List<NodeRelation> getMenuItems(int language_CD)
        {
            string sql = @"Select m.Menu_ID,
                                    m.Parent_ID,
                                    m.Header,
                                    mt.Display_Text as Text 
                            From dbo.Menu m
                                JOIN dbo.MenuTranslation mt
                                    ON m.Menu_ID = mt.Menu_ID
                            WHERE mt.Language_CD = @L_CD
                            
                            ";
            var relations = this._db.Query<FlatData>(sql, new {L_CD = language_CD }).ToList();
            var rtval = relations.Select(x => new NodeRelation() {
                child = new Node() {ID = x.Menu_ID , Text = x.Text},
                parent = new Node() {ID = x.Parent_ID }
            }).ToList();

            return rtval;
        }

        public void saveNodeTranslation(Node node, int language)
        {
            string sql = @" Update dbo.MenuTranslation
                            Set Display_Text = @Text
                            where Menu_ID = @ID
                            AND Language_CD = @Lang
                        ";
            this._db.Execute(sql, new { Text = node.Text, ID = node.ID, Lang = language });
        }

        public void insertNode(Node ChildNode, int language, Node ParentNode)
        {
            var nextID= this._db.Query<int>(@"SELECT MAX(Menu_ID) 
                            From dbo.Menu").Single() + 1;
            string sql1 = @"INSERT into dbo.Menu(Menu_ID, Parent_ID)
                            VALUES(@ID, @Parent_ID)
                            ";
            this._db.Execute(sql1, new { ID = nextID, Parent_ID = ParentNode.ID });

            foreach( var i in getLanguages())
            {
                if (i.language_CD == language)
                {
                    string sql = @"INSERT into dbo.MenuTranslation(Menu_ID, Language_CD, Display_Text)
                            VALUES(@ID, @lang, @Text)";
                    this._db.Execute(sql, new { ID = nextID, lang = i.language_CD, Text = ChildNode.Text });
                }
                else
                {
                    string sql = @"INSERT into dbo.MenuTranslation(Menu_ID, Language_CD, Display_Text)
                            VALUES(@ID, @lang, @Text)";
                    this._db.Execute(sql, new { ID = nextID, lang = i.language_CD, Text = i.language + " translation of "+ ChildNode.Text });
                }

            }
            
        }

        public void deleteNode(Node node)
        {
            string sql1 = @"DELETE FROM dbo.MenuTranslation
                            WHERE Menu_ID = @ID";
            this._db.Execute(sql1, new { ID = node.ID });
            string sql2 = @"DELETE FROM dbo.Menu
                            WHERE Menu_ID = @ID";
            this._db.Execute(sql2, new { ID = node.ID });
           
        }
    }

    public class FlatData
    {
        public int Menu_ID { get; set; }
        public int Parent_ID { get; set; }
        public string Header { get; set; }
        public string Text { get; set; }
    }

    public class Language {
        public int language_CD { get; set; }
        public string language { get; set; }
    }

}