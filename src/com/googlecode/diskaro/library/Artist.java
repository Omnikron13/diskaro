package com.googlecode.diskaro.library;

import java.sql.SQLException;
import java.util.ArrayList;

public class Artist extends TagCore {
	/**
	 * Returns the name of the primary table used to store artists.
	 * This is primarily so methods such as DataCore.get() can be used.
	 * @return primary table name - "artists"
	 */
	public static String table() {
		return "artists";
	}
	protected String getTable() {
		return table();
	}
	protected String getRelationshipTable() {
		return "artistPseudonyms";
	}
	
	/**
	 * Loads an artist from the database by a specified uid
	 * @param id the internal uid
	 * @throws SQLException
	 */
	public Artist(int id) throws SQLException {
		super(id);
	}
	
	/**
	 * Adds a new artist entry to the database, and returns a corresponding Artist object
	 * that can be used to manipulate the new artist.
	 * @param name name of the new artist to be created
	 * @return Artist object representing the newly added artist
	 */
	public static Artist add(String name) throws SQLException {
		return new Artist(add(name, table()));
	}
	
	/**
	 * Returns an ArrayList of Artist objects of all the artists in the database.
	 * @return the list
	 * @throws Exception
	 */
	public static ArrayList<Artist> get() throws Exception {
		return (ArrayList<Artist>)get(Artist.class);
	}
}
