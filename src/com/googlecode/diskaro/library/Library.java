package com.googlecode.diskaro.library;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import org.apache.commons.io.FileUtils;

public class Library {
	
	protected static Connection dbConnection = null;
	protected static String dbFile = "library.db";
	
	protected static void openDB() throws SQLException {
		if(dbConnection == null) {
			dbConnection = DriverManager.getConnection("jdbc:sqlite:" + dbFile);
			dbConnection.prepareStatement("PRAGMA foreign_keys = ON;").executeUpdate();
		}
	}
	
	public static Connection getDB() throws SQLException {
		openDB();
		return dbConnection;
	}
	
	public static void setupdDB() {
		try {
			// create a database connection
			openDB();
			Statement s = getDB().createStatement();//getStatement();
			//File shit... This badly needs properly designing
			File sql = new File("sql");
			File tags = new File(sql, "tags.sql");
			File genres = new File(sql, "genres.sql");
			File labels = new File(sql, "labels.sql");
			File artists = new File(sql, "artists.sql");
			File releases = new File(sql, "releases.sql");
			File tracks = new File(sql, "tracks.sql");
			//Process schema files
			processSchema(s, tags);
			processSchema(s, genres);
			processSchema(s, labels);
			processSchema(s, artists);
			processSchema(s, releases);
			processSchema(s, tracks);
		}
		catch(Exception e) {
			System.err.println("setupDB: " + e.getMessage());
		}
		finally {
		}
	}
	
	//Really not happy with having to do this...
	//Moving each statement in the schema to its own file (and each section into its
	//own directory) might be better?
	// Also, perhaps use templates for similar tables e.g. tags/genres/labels?
	protected static void processSchema(Statement st, File f) throws IOException, SQLException {
		for(String s : FileUtils.readFileToString(f).split(";")) {
			if(s.length() > 1) {
				st.executeUpdate(s);
			}
		}
	}
}
