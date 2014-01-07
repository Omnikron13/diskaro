package com.googlecode.diskaro.library;

import java.sql.*;
import java.util.ArrayList;

public class Genre extends TagCore {
	/**
	 * Returns the name of the primary table used to store genres.
	 * This is primarily so methods such as DataCore.get() can be used.
	 * @return primary table name - "genres"
	 */
	public static String table() {
		return "genres";
	}
	protected String getTable() {
		return table();
	}
	protected String getRelationshipTable() {
		return "subGenres";
	}
	
	public Genre(int id) throws SQLException {
		super(id);
	}
	
	public Genre(String name) throws SQLException {
		super(name);
	}
	
	/**
	 * Adds a new genre entry to the database
	 */
	public static Genre add(String name) throws SQLException {
		return new Genre(add(name, table()));
	}
	
	/**
	 * Returns an ArrayList of Genre objects of all the genres in the database.
	 * @return the list
	 * @throws Exception
	 */
	public static ArrayList<Genre> get() throws Exception {
		return (ArrayList<Genre>)get(Genre.class);
	}
}
